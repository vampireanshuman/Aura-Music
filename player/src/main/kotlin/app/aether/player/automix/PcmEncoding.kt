// AETHER: BitChord's PCM encodings (app/src/main/java/com/music/bitchord/playback/audio/PcmEncoding.kt,
// github.com/kushagrasinghx/BitChord), as [PcmBoundary] reads them; written from its uses.
package app.aether.player.automix

/** A raw PCM sample format, and how many bytes one sample of it takes. */
enum class PcmEncoding(val bytesPerSample: Int) {
    PCM_16BIT(2),
    PCM_24BIT_PACKED(3),
    PCM_32BIT(4),
    PCM_FLOAT(4),
    ;

    /** Bytes in one frame of [channelCount] channels. */
    fun bytesPerFrame(channelCount: Int): Int = bytesPerSample * channelCount
}
