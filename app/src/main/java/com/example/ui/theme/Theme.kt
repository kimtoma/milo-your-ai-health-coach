package com.example.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val FoldStudioDarkColorScheme = darkColorScheme(
    primary = FoldCyanPrimary,
    onPrimary = Color(0xFF042F49),
    primaryContainer = FoldCyanContainer,
    onPrimaryContainer = FoldOnCyanContainer,
    secondary = FoldIndigoSecondary,
    onSecondary = Color(0xFF1E1B4B),
    secondaryContainer = FoldIndigoContainer,
    onSecondaryContainer = FoldOnIndigoContainer,
    tertiary = FoldAmberTertiary,
    onTertiary = Color(0xFF451A03),
    background = ObsidianBg,
    onBackground = TextPrimaryDark,
    surface = SlateSurface,
    onSurface = TextPrimaryDark,
    surfaceVariant = SlateSurfaceElevated,
    onSurfaceVariant = TextSecondaryDark,
    outline = SlateCardBorder
)

val FoldShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(22.dp),
    extraLarge = RoundedCornerShape(28.dp)
)

@Composable
fun MyApplicationTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = FoldStudioDarkColorScheme,
        typography = Typography,
        shapes = FoldShapes,
        content = content
    )
}
