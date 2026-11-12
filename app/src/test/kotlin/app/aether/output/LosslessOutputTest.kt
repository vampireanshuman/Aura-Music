package app.aether.output

import android.media.AudioDeviceInfo
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** BitChord's lossless-output test, as ported: cables count, and Bluetooth only on a named lossless-class codec. */
class LosslessOutputTest {
    private val speaker = AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
    private val a2dp = AudioDeviceInfo.TYPE_BLUETOOTH_A2DP

    @Test fun `the speaker alone isn't one`() = assertFalse(LosslessOutput.decide(setOf(speaker), null).capable)

    @Test fun `a cable is, whatever Bluetooth says`() {
        val usb = LosslessOutput.decide(setOf(speaker, AudioDeviceInfo.TYPE_USB_HEADSET, a2dp), "SBC")
        assertTrue(usb.capable)
        assertEquals(LosslessOutput.Kind.USB, usb.via)
        assertEquals(LosslessOutput.Kind.WIRED, LosslessOutput.decide(setOf(AudioDeviceInfo.TYPE_WIRED_HEADPHONES), null).via)
        assertEquals(LosslessOutput.Kind.HDMI, LosslessOutput.decide(setOf(29), null).via)
    }

    @Test fun `Bluetooth counts only on a lossless-class codec Android named`() {
        assertTrue(LosslessOutput.decide(setOf(a2dp), "LDAC").capable)
        assertTrue(LosslessOutput.decide(setOf(a2dp), "LHDC V5").capable)
        assertTrue(LosslessOutput.decide(setOf(a2dp), "aptX Lossless").capable)
        assertFalse(LosslessOutput.decide(setOf(a2dp), "AAC").capable)
        assertFalse(LosslessOutput.decide(setOf(a2dp), "aptX HD").capable)
    }

    @Test fun `an unnamed codec is said to be unknown, not guessed`() {
        val unknown = LosslessOutput.decide(setOf(a2dp), null)
        assertFalse(unknown.capable)
        assertTrue(unknown.bluetoothCodecUnknown)
    }

    @Test fun `Samsung's codec counts only at UHQ rates`() {
        assertTrue(LosslessOutput.isLosslessBluetoothCodec("Samsung Seamless", 96_000))
        assertFalse(LosslessOutput.isLosslessBluetoothCodec("SSC", 48_000))
        assertTrue(LosslessOutput.isLosslessBluetoothCodec("SSC UHQ"))
    }
}
