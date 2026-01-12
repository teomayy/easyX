package uz.easyx.mobile.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Lime,
    onPrimary = TextOnLime,
    primaryContainer = LimeLight,
    onPrimaryContainer = LimeDark,
    secondary = PurpleStart,
    onSecondary = White,
    secondaryContainer = PurpleEnd,
    onSecondaryContainer = White,
    tertiary = Info,
    onTertiary = White,
    background = White,
    onBackground = TextPrimary,
    surface = White,
    onSurface = TextPrimary,
    surfaceVariant = LightGray,
    onSurfaceVariant = TextSecondary,
    outline = CardBorder,
    error = Error,
    onError = White,
)

private val DarkColorScheme = darkColorScheme(
    primary = Lime,
    onPrimary = TextOnLime,
    primaryContainer = LimeDark,
    onPrimaryContainer = LimeLight,
    secondary = PurpleStart,
    onSecondary = White,
    secondaryContainer = PurpleEnd,
    onSecondaryContainer = White,
    tertiary = Info,
    onTertiary = White,
    background = DarkNavy,
    onBackground = TextOnDark,
    surface = DarkNavyLight,
    onSurface = TextOnDark,
    surfaceVariant = DarkNavyLight,
    onSurfaceVariant = TextTertiary,
    outline = CardBorder,
    error = Error,
    onError = White,
)

@Composable
fun EasyXTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
