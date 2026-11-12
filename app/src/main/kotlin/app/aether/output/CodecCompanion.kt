package app.aether.output

import android.annotation.SuppressLint
import android.companion.AssociationInfo
import android.companion.AssociationRequest
import android.companion.BluetoothDeviceFilter
import android.companion.CompanionDeviceManager
import android.content.Context
import android.content.IntentSender
import android.os.Build

/**
 * The one step Android asks before it names a pair of headphones' codec to an app (since Android 14,
 * `getCodecStatus` answers only the system and apps the headphones are associated with as a companion
 * device): the system's own dialog, naming the headphones, which the listener allows once. Nothing is
 * read from the headphones but the codec they play over; the association can be removed in Android's
 * settings at any time.
 */
object CodecCompanion {
    /**
     * Asks Android to associate AETHER with the headphones at [address]. [onPending] gets the system
     * dialog to show; [onDone] runs once the listener allowed it; [onFailed] says why not.
     */
    @SuppressLint("MissingPermission")
    fun ask(context: Context, address: String, onPending: (IntentSender) -> Unit, onDone: () -> Unit, onFailed: (String) -> Unit) {
        val manager = context.getSystemService(CompanionDeviceManager::class.java) ?: return onFailed("This phone has no companion device service.")
        val request = AssociationRequest.Builder()
            .addDeviceFilter(BluetoothDeviceFilter.Builder().setAddress(address).build())
            .setSingleDevice(true)
            .build()
        runCatching {
            if (Build.VERSION.SDK_INT >= 33) {
                manager.associate(request, context.mainExecutor, object : CompanionDeviceManager.Callback() {
                    override fun onAssociationPending(intentSender: IntentSender) = onPending(intentSender)
                    override fun onAssociationCreated(associationInfo: AssociationInfo) = onDone()
                    override fun onFailure(error: CharSequence?) = onFailed(error?.toString() ?: "Android didn't make the association.")
                })
            } else {
                @Suppress("DEPRECATION")
                manager.associate(request, object : CompanionDeviceManager.Callback() {
                    @Deprecated("Deprecated in Java")
                    override fun onDeviceFound(chooserLauncher: IntentSender) = onPending(chooserLauncher)
                    override fun onFailure(error: CharSequence?) = onFailed(error?.toString() ?: "Android didn't make the association.")
                }, null)
            }
        }.onFailure { onFailed(it.message ?: "Android didn't make the association.") }
    }
}
