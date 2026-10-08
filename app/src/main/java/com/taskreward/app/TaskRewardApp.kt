package com.taskreward.app

import android.app.Application

class TaskRewardApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Firebase is automatically initialized via Google Services Gradle plugin
    }
}
