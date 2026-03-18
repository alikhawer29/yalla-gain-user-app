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
                // Clear buffer BEFORE starting — so we only read NEW lines from this moment on.
                // Prevents replaying SocketConnectedGame from a previous session.
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

                    when {
                        trimmed.contains("SocketConnectedGame") -> {
                            Log.d("UnityLogcat", "SocketConnectedGame → emitting to JS")
                            emitToJS("SocketConnectedGame")
                        }
                        trimmed == "SaveGame" || trimmed == "GoBack" -> {
                            Log.d("UnityLogcat", "$trimmed detected → pausing Unity + emitting to JS")
                            // Step 1: Pause Unity immediately on the main thread to stop the render loop.
                            // This must happen before JS navigation to prevent the SIGSEGV crash.
                            val handler = android.os.Handler(android.os.Looper.getMainLooper())
                            handler.post {
                                try {
                                    com.azesmwayreactnativeunity.ReactNativeUnity.pause()
                                    Log.d("UnityLogcat", "Unity paused for $trimmed")
                                } catch (e: Exception) {
                                    Log.e("UnityLogcat", "Failed to pause Unity: ${e.message}")
                                }
                            }
                            // Step 2: Emit to JS so RN cleans up state and navigates
                            emitToJS(trimmed)
                        }
                    }
                }

                reader.close()
                process.destroy()
                logcatProcess = null
                Log.d("UnityLogcat", "Logcat listener stopped")
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
        Log.d("UnityLogcat", "Stopping logcat listener")
        isRunning = false

        // Kill the logcat process so the readLine() unblocks immediately
        logcatProcess?.destroy()
        logcatProcess = null

        logcatThread?.interrupt()
        logcatThread = null

        // Clear buffer on stop so next session starts completely fresh
        clearLogcatBuffer()
        Log.d("UnityLogcat", "Logcat listener stopped and buffer cleared")
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