package com.blitzapp.yallagain

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class UnityLogcatModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "UnityLogcatModule"

    private var logcatProcess: Process? = null
    private var logcatThread: Thread? = null
    @Volatile private var isRunning = false

    private fun clearLogcatBuffer() {
        try {
            Runtime.getRuntime().exec(arrayOf("logcat", "-c")).waitFor()
            Log.d("UnityLogcat", "Logcat buffer cleared")
        } catch (e: Exception) {
            Log.e("UnityLogcat", "Failed to clear logcat buffer: ${e.message}")
        }
    }

    @ReactMethod
    fun startListening() {
        if (isRunning) {
            Log.d("UnityLogcat", "Already listening, skipping")
            return
        }
        isRunning = true

        logcatThread = Thread {
            try {
                clearLogcatBuffer()
                Log.d("UnityLogcat", "Started — listening for new Unity messages only")

                val process = Runtime.getRuntime().exec(
                    arrayOf("logcat", "-v", "raw", "-s", "Unity:I")
                )
                logcatProcess = process
                val reader = process.inputStream.bufferedReader()

                while (isRunning) {
                    val line = reader.readLine() ?: break
                    val trimmed = line.trim()
                    if (trimmed.isEmpty()) continue

                    Log.d("UnityLogcat", "Unity → $trimmed")

                    if (trimmed.contains("SocketConnectedGame")) {
                        Log.d("UnityLogcat", "SocketConnectedGame → emitting to JS then stopping")
                        emitToJS("SocketConnectedGame")
                        isRunning = false
                        break
                    }
                }

                reader.close()
                process.destroy()
                logcatProcess = null
                Log.d("UnityLogcat", "Logcat listener stopped after SocketConnectedGame")
            } catch (e: Exception) {
                Log.e("UnityLogcat", "Logcat error: ${e.message}")
            }
        }.also {
            it.isDaemon = true
            it.name = "UnityLogcatThread"
            it.start()
        }
    }

    @ReactMethod
    fun stopListening() {
        if (!isRunning && logcatProcess == null) {
            Log.d("UnityLogcat", "Already stopped, skipping")
            return
        }
        Log.d("UnityLogcat", "Stopping logcat listener")
        isRunning = false
        logcatProcess?.destroy()
        logcatProcess = null
        logcatThread = null
        Log.d("UnityLogcat", "Logcat listener stopped")
    }

    private fun emitToJS(message: String) {
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("UnityMessage", message)
            Log.d("UnityLogcat", "Emitted to JS: $message")
        } catch (e: Exception) {
            Log.e("UnityLogcat", "Failed to emit to JS: ${e.message}")
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}