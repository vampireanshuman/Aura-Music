package app.aether.player

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.nio.ByteBuffer

/**
 * Tags written into a kept M4A without disturbing a byte of its audio, for the layouts YouTube's copies
 * and older files come in; and left alone where they can't be placed safely.
 */
class Mp4TagsTest {
    private fun box(type: String, vararg parts: ByteArray): ByteArray {
        val payload = parts.fold(ByteArray(0)) { a, b -> a + b }
        return ByteBuffer.allocate(8 + payload.size).putInt(8 + payload.size).put(type.toByteArray(Charsets.ISO_8859_1)).put(payload).array()
    }
    private fun full(type: String, flags: Int, vararg parts: ByteArray) = box(type, ByteBuffer.allocate(4).putInt(flags).array(), *parts)
    private fun ints(vararg v: Int) = ByteBuffer.allocate(4 * v.size).apply { v.forEach { putInt(it) } }.array()

    private val ftyp = box("ftyp", "dash".toByteArray(), ints(0), "iso6".toByteArray())
    private fun stbl(offsets: IntArray) = box("stbl", full("stsd", 0, ints(0)), full("stco", 0, ints(offsets.size, *offsets)))
    private fun moov(offsets: IntArray = IntArray(0), udta: ByteArray? = null) = box(
        "moov",
        full("mvhd", 0, ByteArray(96)),
        box("trak", full("tkhd", 0, ByteArray(80)), box("mdia", box("minf", stbl(offsets)))),
        *listOfNotNull(udta).toTypedArray(),
    )
    private val youtubeUdta = box("udta", full("meta", 0, box("hdlr", ByteArray(8), "mdirappl".toByteArray(), ByteArray(9)), box("ilst", box("©too", box("data", ints(1, 0), "Google".toByteArray())))))
    private fun moof(flags: Int) = box("moof", full("mfhd", 0, ints(1)), box("traf", full("tfhd", flags, ints(1)), full("trun", 0x201, ints(1, 8))))
    private val audio = box("mdat", ByteArray(4000) { (it * 31).toByte() })
    private val sidx = full("sidx", 0, ByteArray(40) { 7 })

    private fun tags(cover: ByteArray? = JPEG) = Mp4Tags.Tags("Gabriela", "KATSEYE", "Gabriela", 2025, 3, "[00:01.00]Hot", cover, """{"id":"ytm:x"}""")

    private fun tag(file: ByteArray, tags: Mp4Tags.Tags = tags()): ByteArray? {
        val raw = File.createTempFile("aether", ".m4a").apply { writeBytes(file); deleteOnExit() }
        val out = ByteArrayOutputStream()
        return if (Mp4Tags.write(raw, out, tags)) out.toByteArray() else null.also { assertEquals("nothing written when refused", 0, out.size()) }
    }

    /** The top-level boxes, as (type, bytes). */
    private fun top(b: ByteArray): List<Pair<String, ByteArray>> {
        val out = ArrayList<Pair<String, ByteArray>>()
        var at = 0
        while (at < b.size) {
            val size = ByteBuffer.wrap(b, at, 4).int
            out += String(b, at + 4, 4, Charsets.ISO_8859_1) to b.copyOfRange(at, at + size)
            at += size
        }
        return out
    }

    private fun ByteArray.has(text: String) = String(this, Charsets.ISO_8859_1).contains(text)
    private fun ByteArray.has(bytes: ByteArray) = (0..size - bytes.size).any { i -> bytes.indices.all { this[i + it] == bytes[it] } }

    @Test
    fun `YouTube's fragmented copy is tagged, its fragments untouched`() {
        val file = ftyp + moov(udta = youtubeUdta) + sidx + moof(0x2002A) + audio + moof(0x2002A) + audio
        val tagged = assertNotNull(tag(file)).let { tag(file)!! }
        val before = top(file)
        val after = top(tagged)
        assertEquals(before.map { it.first }, after.map { it.first })
        // Everything after the header is the same, byte for byte.
        for (i in before.indices) if (before[i].first != "moov") assertArrayEquals(before[i].second, after[i].second)
        val moov = after.first { it.first == "moov" }.second
        assertTrue(moov.has("©nam") && moov.has("Gabriela") && moov.has("©ART") && moov.has("KATSEYE"))
        assertTrue(moov.has("covr") && moov.has(JPEG))
        assertTrue(moov.has("©lyr") && moov.has("trkn") && moov.has("AETHER_TRACK"))
        // YouTube's own user data is replaced, not kept beside it.
        assertFalse(moov.has("Google"))
        assertEquals(1, Regex("udta").findAll(String(moov, Charsets.ISO_8859_1)).count())
    }

    @Test
    fun `an older file's chunk offsets move with the larger header`() {
        val head = ftyp.size + moov(intArrayOf(0, 0)).size
        val offsets = intArrayOf(head + 8, head + 8 + 2000)
        val file = ftyp + moov(offsets) + audio
        val tagged = tag(file)!!
        val grown = tagged.size - file.size
        assertTrue(grown > 0)
        // The stco entries now point at the same audio, where it now is.
        val stco = String(tagged, Charsets.ISO_8859_1).indexOf("stco")
        val now = ByteBuffer.wrap(tagged, stco + 12, 8).let { intArrayOf(it.int, it.int) }
        assertArrayEquals(intArrayOf(offsets[0] + grown, offsets[1] + grown), now)
        assertArrayEquals(audio.copyOfRange(8, 40), tagged.copyOfRange(now[0], now[0] + 32))
    }

    @Test
    fun `a header after the audio moves nothing`() {
        val file = ftyp + audio + moov(intArrayOf(ftyp.size + 8))
        val tagged = tag(file)!!
        val stco = String(tagged, Charsets.ISO_8859_1).indexOf("stco")
        assertEquals(ftyp.size + 8, ByteBuffer.wrap(tagged, stco + 12, 4).int)
    }

    @Test
    fun `fragments placed by absolute position are left alone`() {
        val file = ftyp + moov() + moof(0x2002B) + audio
        assertEquals(null, tag(file))
    }

    @Test
    fun `a broken file is left alone`() {
        assertEquals(null, tag(ftyp + moov().copyOf(60)))
        assertEquals(null, tag(ftyp + audio))
    }

    @Test
    fun `a cover that isn't a JPEG or PNG isn't written`() {
        val tagged = tag(ftyp + moov() + audio, tags(cover = "RIFF0000WEBPVP8 ".toByteArray()))!!
        assertFalse(tagged.has("covr"))
        assertTrue(tagged.has("©nam"))
    }

    @Test
    fun `a picture's size is read from its own header`() {
        assertEquals(Triple(1425, 1200, 24), OggOpus.dimensions(JPEG))
        assertEquals(Triple(600, 300, 32), OggOpus.dimensions(PNG))
        assertEquals(null, OggOpus.dimensions("RIFF0000WEBPVP8 ".toByteArray()))
    }

    @Test
    fun `a real copy, when one has been fetched`() {
        val sample = File("build/aac-sample.m4a").takeIf { it.exists() } ?: return
        val cover = File("build/aac-cover.jpg").takeIf { it.exists() }?.readBytes() ?: JPEG
        val out = File("build/aac-sample.tagged.m4a")
        out.outputStream().use { assertTrue(Mp4Tags.write(sample, it, tags(cover))) }
        assertTrue(out.length() > sample.length())
    }

    private companion object {
        /** A JPEG's opening: SOI, an APP0, then a baseline frame 1425 wide, 1200 tall, three 8-bit components. */
        val JPEG = byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0xFF.toByte(), 0xE0.toByte(), 0, 16) + "JFIF".toByteArray() + ByteArray(10) +
            byteArrayOf(0xFF.toByte(), 0xC0.toByte(), 0, 17, 8, (1200 shr 8).toByte(), 1200.toByte(), (1425 shr 8).toByte(), 1425.toByte(), 3) + ByteArray(9) +
            byteArrayOf(0xFF.toByte(), 0xD9.toByte())

        /** A PNG's opening: the signature and an IHDR, 600 by 300, 8 bits, RGBA. */
        val PNG = byteArrayOf(0x89.toByte(), 'P'.code.toByte(), 'N'.code.toByte(), 'G'.code.toByte(), 13, 10, 26, 10, 0, 0, 0, 13) + "IHDR".toByteArray() +
            ByteBuffer.allocate(8).putInt(600).putInt(300).array() + byteArrayOf(8, 6, 0, 0, 0)
    }
}
