package com.yallagainapp

import android.os.Bundle
import com.zoontek.rnbootsplash.RNBootSplash

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.orientationturbo.OrientationTurbo
import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate


class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Yalla Gain"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    OrientationTurbo.lockToPortrait(this)
    RNBootSplash.init(this, R.style.BootTheme)
    super.onCreate(null)
    // Must run after super.onCreate so ComponentActivity can register the permission contract (react-native-health-connect README).
    HealthConnectPermissionDelegate.setPermissionDelegate(this)
  }
}
