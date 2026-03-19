package com.blitzapp.yallagain

import android.content.Context
import android.util.Log

object CrashHandlerHelper {
    init {
        try {
            System.loadLibrary("crashhandler")
            Log.d("CrashHandlerHelper", "crashhandler native library loaded")
        } catch (e: UnsatisfiedLinkError) {
            Log.e("CrashHandlerHelper", "Failed to load crashhandler: ${e.message}")
        }
    }

    external fun installCrashHandler(applicationContext: Context)
}
