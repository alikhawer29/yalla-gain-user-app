package com.blitzapp.yallagain

import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Direct Android audio routing for VoIP sessions.
 * Zoom Video SDK's setSpeaker() is unreliable on many Android devices.
 */
class AndroidAudioRouteModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AndroidAudioRoute"

    private fun audioManager(): AudioManager? =
        reactContext.getSystemService(Context.AUDIO_SERVICE) as? AudioManager

    private fun runOnUiThread(action: () -> Unit) {
        val activity = reactApplicationContext.currentActivity
        if (activity != null) {
            activity.runOnUiThread(action)
        } else {
            reactApplicationContext.runOnUiQueueThread(action)
        }
    }

    @ReactMethod
    fun setSpeakerphoneOn(enabled: Boolean, promise: Promise) {
        runOnUiThread {
            try {
                val am = audioManager()
                if (am == null) {
                    promise.reject("NO_AUDIO", "AudioManager unavailable")
                    return@runOnUiThread
                }

                val applied = applySpeakerRoute(am, enabled)
                promise.resolve(applied)
            } catch (e: Exception) {
                promise.reject("SPEAKER_ROUTE_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun isSpeakerphoneOn(promise: Promise) {
        try {
            val am = audioManager()
            if (am == null) {
                promise.resolve(true)
                return
            }
            promise.resolve(readSpeakerphoneOn(am))
        } catch (e: Exception) {
            promise.reject("SPEAKER_STATUS_ERROR", e.message, e)
        }
    }

    private fun applySpeakerRoute(am: AudioManager, enabled: Boolean): Boolean {
        am.mode = AudioManager.MODE_IN_COMMUNICATION

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (enabled) {
                val speaker = am.availableCommunicationDevices.firstOrNull {
                    it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
                }
                if (speaker != null && am.setCommunicationDevice(speaker)) {
                    return true
                }
            } else {
                val earpiece = am.availableCommunicationDevices.firstOrNull {
                    it.type == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE
                }
                if (earpiece != null && am.setCommunicationDevice(earpiece)) {
                    return true
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    am.clearCommunicationDevice()
                }
            }
        }

        @Suppress("DEPRECATION")
        am.isSpeakerphoneOn = enabled
        return readSpeakerphoneOn(am)
    }

    private fun readSpeakerphoneOn(am: AudioManager): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val device = am.communicationDevice
            if (device != null) {
                return device.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
            }
        }

        @Suppress("DEPRECATION")
        return am.isSpeakerphoneOn
    }
}
