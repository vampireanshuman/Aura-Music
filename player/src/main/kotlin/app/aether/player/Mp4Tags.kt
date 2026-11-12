package app.aether.player

import java.io.ByteArrayOutputStream
import java.io.File
import java.io.OutputStream
import java.io.RandomAccessFile
import java.nio.charset.StandardCharsets

/**
 * iTunes-style tags for a kept M4A (YouTube's AAC copy): the song's name, artist, album, year, number,
 * words and cover, in `moov/udta/meta/ilst`, where every player and file manager looks for them.
 * The audio is never touched: only the small `moov` header is rebuilt, and everything after it is
 * copied byte for byte.
 *
 * YouTube's copies are fragmented (`moov` then `sidx` then `moof`/`mdat` pairs, each fragment placing
 * its samples relative to itself), so a larger header moves nothing that's pointed at. A file laid out
 * the older way (absolute chunk offsets after the header) has those offsets moved with it. Anything
 * this can't place safely is left alone: [write] answers false, and the file is kept as it came.
 */
internal object Mp4Tags {
    class Tags(
        val title: String,
        val artist: String?,
        val album: String?,
        val year: Int?,
        val number: Int?,
        val lyrics: String?,
        /** A JPEG or PNG; anything else isn't written. */
        val cover: ByteArray?,
        /** The whole track, as AETHER keeps it, for the file to carry its own record. */
        val aether: String?,
    )

    private class Box(val at: Long, val size: Long, val header: Int, val type: String)

    /** [raw] with [tags] in its header, written to [out]. False (nothing written) when it can't be done safely. */
    fun write(raw: File, out: OutputStream, tags: Tags): Boolean {
        RandomAccessFile(raw, "r").use { file ->
            val top = boxes(file, 0, file.length()) ?: return false
            val moov = top.singleOrNull { it.type == "moov" } ?: return false
            if (moov.size > MAX_HEADER) return false
            val header = ByteArray(moov.size.toInt()).also { file.seek(moov.at); file.readFully(it) }

            // The header's children, the old user data left out: the new goes at the end.
            val children = boxes(header, moov.header, header.size) ?: return false
            val oldUdta = children.filter { it.type == "udta" }.sumOf { it.size }
            val udta = udta(tags)
            val delta = udta.size - oldUdta
            val audioAfter = top.any { it.type == "mdat" && it.at > moov.at }

            // Absolute positions in the fragments can't be moved here: such a file stays as it is.
            if (audioAfter && top.any { it.type == "moof" && it.at > moov.at && absoluteFragment(file, it) }) return false
            if (audioAfter && !shiftChunkOffsets(header, children, delta)) return false

            val body = ByteArrayOutputStream(header.size + udta.size)
            for (c in children) if (c.type != "udta") body.write(header, c.at.toInt(), c.size.toInt())
            body.write(udta)
            val newSize = 8L + body.size()
            if (newSize > Int.MAX_VALUE) return false

            // Everything before the header, the new header, everything after it.
            copy(file, 0, moov.at, out)
            out.write(be32(newSize.toInt()))
            out.write("moov".toByteArray(StandardCharsets.ISO_8859_1))
            body.writeTo(out)
            copy(file, moov.at + moov.size, file.length() - moov.at - moov.size, out)
            return true
        }
    }

    // --- The tags ----------------------------------------------------------------------------------

    private fun udta(t: Tags): ByteArray {
        val items = ByteArrayOutputStream()
        fun text(type: ByteArray, value: String?) { value?.takeIf { it.isNotBlank() }?.let { items.write(item(type, data(1, it.toByteArray(StandardCharsets.UTF_8)))) } }
        text(NAM, t.title)
        text(ART, t.artist)
        text(ALB, t.album)
        text(DAY, t.year?.toString())
        t.number?.takeIf { it in 1..65535 }?.let { n -> items.write(item("trkn".latin(), data(0, byteArrayOf(0, 0, (n shr 8).toByte(), n.toByte(), 0, 0, 0, 0)))) }
        text(LYR, t.lyrics)
        t.cover?.let { c -> kindOf(c)?.let { kind -> items.write(item("covr".latin(), data(kind, c))) } }
        t.aether?.let { a ->
            items.write(
                box("----", box("mean", ByteArray(4) + "app.aether".latin()) + box("name", ByteArray(4) + "AETHER_TRACK".latin()) + data(1, a.toByteArray(StandardCharsets.UTF_8))),
            )
        }
        // The handler that says these are iTunes tags, as every tagger writes it.
        val hdlr = box("hdlr", ByteArray(8) + "mdir".latin() + "appl".latin() + ByteArray(9))
        val meta = box("meta", ByteArray(4) + hdlr + box("ilst", items.toByteArray()))
        return box("udta", meta)
    }

    /** JPEG 13, PNG 14, as the `data` box's type says it; null for anything else. */
    private fun kindOf(b: ByteArray): Int? = when {
        b.size > 3 && b[0] == 0xFF.toByte() && b[1] == 0xD8.toByte() -> 13
        b.size > 8 && b[0] == 0x89.toByte() && b[1] == 'P'.code.toByte() && b[2] == 'N'.code.toByte() -> 14
        else -> null
    }

    private fun item(type: ByteArray, data: ByteArray) = sized(type, data)
    private fun data(kind: Int, payload: ByteArray) = box("data", be32(kind) + ByteArray(4) + payload)
    private fun box(type: String, payload: ByteArray) = sized(type.latin(), payload)
    private fun sized(type: ByteArray, payload: ByteArray) = be32(8 + payload.size) + type + payload

    // --- Reading the layout ------------------------------------------------------------------------

    /** The boxes between [from] and [to] in the file; null if they don't add up. */
    private fun boxes(file: RandomAccessFile, from: Long, to: Long): List<Box>? {
        val out = ArrayList<Box>()
        var at = from
        val head = ByteArray(16)
        while (at < to) {
            if (to - at < 8) return null
            file.seek(at)
            file.readFully(head, 0, 8)
            var size = u32(head, 0)
            var header = 8
            if (size == 1L) {
                if (to - at < 16) return null
                file.readFully(head, 8, 8)
                size = u64(head, 8)
                header = 16
            } else if (size == 0L) {
                size = to - at
            }
            if (size < header || at + size > to) return null
            out += Box(at, size, header, String(head, 4, 4, StandardCharsets.ISO_8859_1))
            at += size
        }
        return out
    }

    private fun boxes(b: ByteArray, from: Int, to: Int): List<Box>? {
        val out = ArrayList<Box>()
        var at = from
        while (at < to) {
            if (to - at < 8) return null
            var size = u32(b, at)
            var header = 8
            if (size == 1L) {
                if (to - at < 16) return null
                size = u64(b, at + 8)
                header = 16
            } else if (size == 0L) {
                size = (to - at).toLong()
            }
            if (size < header || at + size > to) return null
            out += Box(at.toLong(), size, header, String(b, at + 4, 4, StandardCharsets.ISO_8859_1))
            at += size.toInt()
        }
        return out
    }

    /** Whether a fragment places its samples by absolute position (a `tfhd` with a base data offset). */
    private fun absoluteFragment(file: RandomAccessFile, moof: Box): Boolean {
        if (moof.size > MAX_HEADER) return true
        val b = ByteArray(moof.size.toInt()).also { file.seek(moof.at); file.readFully(it) }
        val trafs = boxes(b, moof.header, b.size)?.filter { it.type == "traf" } ?: return true
        for (traf in trafs) {
            val inner = boxes(b, traf.at.toInt() + traf.header, (traf.at + traf.size).toInt()) ?: return true
            for (tfhd in inner.filter { it.type == "tfhd" }) {
                val flags = u32(b, tfhd.at.toInt() + tfhd.header) and 0xFFFFFF
                if (flags and 1L != 0L) return true
            }
        }
        return false
    }

    /** Moves every chunk offset in the header's tracks by [delta]; false if one would overflow. */
    private fun shiftChunkOffsets(header: ByteArray, children: List<Box>, delta: Long): Boolean {
        if (delta == 0L) return true
        for (trak in children.filter { it.type == "trak" }) {
            val stbls = path(header, trak, listOf("mdia", "minf", "stbl")) ?: continue
            for (stbl in stbls) {
                val tables = boxes(header, stbl.at.toInt() + stbl.header, (stbl.at + stbl.size).toInt()) ?: return false
                for (t in tables) {
                    val p = t.at.toInt() + t.header + 4
                    when (t.type) {
                        "stco" -> {
                            val n = u32(header, p).toInt()
                            if (p + 4 + n * 4L > t.at + t.size) return false
                            for (i in 0 until n) {
                                val v = u32(header, p + 4 + i * 4) + delta
                                if (v < 0 || v > 0xFFFFFFFFL) return false
                                put32(header, p + 4 + i * 4, v)
                            }
                        }
                        "co64" -> {
                            val n = u32(header, p).toInt()
                            if (p + 4 + n * 8L > t.at + t.size) return false
                            for (i in 0 until n) put64(header, p + 4 + i * 8, u64(header, p + 4 + i * 8) + delta)
                        }
                    }
                }
            }
        }
        return true
    }

    /** The boxes at [names] below [box], every branch; null if the header can't be read. */
    private fun path(b: ByteArray, box: Box, names: List<String>): List<Box>? {
        if (names.isEmpty()) return listOf(box)
        val inner = boxes(b, box.at.toInt() + box.header, (box.at + box.size).toInt()) ?: return null
        return inner.filter { it.type == names.first() }.flatMap { path(b, it, names.drop(1)) ?: return null }
    }

    private fun copy(file: RandomAccessFile, from: Long, length: Long, out: OutputStream) {
        file.seek(from)
        val buffer = ByteArray(256 * 1024)
        var left = length
        while (left > 0) {
            val n = file.read(buffer, 0, minOf(buffer.size.toLong(), left).toInt())
            if (n < 0) throw java.io.EOFException()
            out.write(buffer, 0, n)
            left -= n
        }
    }

    private fun u32(b: ByteArray, at: Int): Long =
        ((b[at].toLong() and 0xFF) shl 24) or ((b[at + 1].toLong() and 0xFF) shl 16) or ((b[at + 2].toLong() and 0xFF) shl 8) or (b[at + 3].toLong() and 0xFF)
    private fun u64(b: ByteArray, at: Int): Long = (u32(b, at) shl 32) or u32(b, at + 4)
    private fun put32(b: ByteArray, at: Int, v: Long) { for (i in 0 until 4) b[at + i] = (v ushr (24 - 8 * i)).toByte() }
    private fun put64(b: ByteArray, at: Int, v: Long) { for (i in 0 until 8) b[at + i] = (v ushr (56 - 8 * i)).toByte() }
    private fun be32(v: Int) = byteArrayOf((v ushr 24).toByte(), (v ushr 16).toByte(), (v ushr 8).toByte(), v.toByte())
    private fun String.latin() = toByteArray(StandardCharsets.ISO_8859_1)

    // ©nam, ©ART, ©alb, ©day, ©lyr: the copyright sign is the box type's first byte.
    private val NAM = byteArrayOf(0xA9.toByte()) + "nam".latin()
    private val ART = byteArrayOf(0xA9.toByte()) + "ART".latin()
    private val ALB = byteArrayOf(0xA9.toByte()) + "alb".latin()
    private val DAY = byteArrayOf(0xA9.toByte()) + "day".latin()
    private val LYR = byteArrayOf(0xA9.toByte()) + "lyr".latin()

    /** A header (or a fragment) larger than this isn't one this reads into memory. */
    private const val MAX_HEADER = 32L * 1024 * 1024
}
