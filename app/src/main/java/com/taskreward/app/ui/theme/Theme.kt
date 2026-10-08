package com.taskreward.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = BluePrimary,
    onPrimary = SurfaceWhite,
    primaryContainer = BlueLight,
    onPrimaryContainer = BluePrimary,
    secondary = RewardGreen,
    onSecondary = SurfaceWhite,
    background = BackgroundLight,
    onBackground = TextDark,
    surface = SurfaceWhite,
    onSurface = TextDark,
    surfaceVariant = BackgroundLight,
    onSurfaceVariant = TextSecondary,
    outline = BorderColor
)

@Composable
fun TaskRewardTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
