package com.yallagainapp

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

  companion object {
    /** Must match JS `FOREGROUND_FCM_CHANNEL_ID` and FCM default meta-data in AndroidManifest. */
    const val DEFAULT_FCM_CHANNEL_ID = "yallagain_fcm_default"
  }

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              add(UnityLogcatPackage())
              add(AndroidAudioRoutePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    createDefaultFcmNotificationChannel()
    loadReactNative(this)
    setupCrashRecovery()
  }

  /**
   * Required before Firebase can show notification payloads while the app is backgrounded/closed.
   * Without this channel (and manifest meta-data), Android 8+ may drop tray notifications.
   */
  private fun createDefaultFcmNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val channel = NotificationChannel(
      DEFAULT_FCM_CHANNEL_ID,
      "General",
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = "General notifications"
      enableVibration(true)
      setShowBadge(true)
    }
    val nm = getSystemService(NotificationManager::class.java)
    nm.createNotificationChannel(channel)
  }

  private fun setupCrashRecovery() {
    // Unity calls Process.killProcess() or causes SIGSEGV when shutting down on Android.
    // We catch uncaught Java/Kotlin exceptions from UnityMain and restart the app.
    // Native SIGSEGV cannot be caught here but the Thread handler catches some Unity quit paths.
    val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
    Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
      Log.e("CrashRecovery", "Uncaught exception in ${thread.name}: ${throwable.message}")
      if (thread.name?.contains("Unity") == true || thread.name?.contains("il2cpp") == true) {
        Log.w("CrashRecovery", "Unity thread crashed — restarting app")
        try {
          val intent = packageManager.getLaunchIntentForPackage(packageName)
          intent?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
          startActivity(intent)
        } catch (e: Exception) {
          Log.e("CrashRecovery", "Failed to restart: ${e.message}")
        }
        android.os.Process.killProcess(android.os.Process.myPid())
      } else {
        defaultHandler?.uncaughtException(thread, throwable)
      }
    }
  }
}