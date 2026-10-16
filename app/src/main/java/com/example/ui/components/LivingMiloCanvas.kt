package com.example.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.model.MiloPoseState
import com.example.model.MiloTurnaroundView
import com.example.ui.theme.FoldAmberTertiary
import com.example.ui.theme.FoldCyanPrimary
import com.example.ui.theme.FoldEmeraldSuccess
import com.example.ui.theme.FoldRoseUrgent
import com.example.ui.theme.MiloBellyCream
import com.example.ui.theme.MiloCheekPeach
import com.example.ui.theme.MiloDeepBlue
import com.example.ui.theme.MiloPlushBlue
import com.example.ui.theme.MiloSkyBlue
import kotlinx.coroutines.delay
import kotlin.math.sin

@Composable
fun LivingMiloStageCard(
    poseState: MiloPoseState,
    turnaroundView: MiloTurnaroundView,
    isVoiceActive: Boolean,
    voiceDecibel: Float,
    petCount: Int,
    onPetMilo: () -> Unit,
    onSelectTurnaround: (MiloTurnaroundView) -> Unit,
    onToggleVoiceMode: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isSquished by remember { mutableStateOf(false) }
    var localPokeTrigger by remember { mutableIntStateOf(0) }

    LaunchedEffect(localPokeTrigger) {
        if (localPokeTrigger > 0) {
            isSquished = true
            delay(280)
            isSquished = false
        }
    }

    val infiniteTransition = rememberInfiniteTransition(label = "milo_breathing")
    val breathPhase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = if (isVoiceActive) 650 else 1900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "breath_phase"
    )

    val tuftAngle by infiniteTransition.animateFloat(
        initialValue = -8f,
        targetValue = 12f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = if (isVoiceActive) 380 else 1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "tuft_angle"
    )

    val squishScaleX by animateFloatAsState(
        targetValue = if (isSquished) 1.14f else 1f + (breathPhase * 0.03f),
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioHighBouncy,
            stiffness = Spring.StiffnessMedium
        ),
        label = "squish_x"
    )

    val squishScaleY by animateFloatAsState(
        targetValue = if (isSquished) 0.86f else 1f - (breathPhase * 0.025f),
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioHighBouncy,
            stiffness = Spring.StiffnessMedium
        ),
        label = "squish_y"
    )

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .border(1.5.dp, Color(poseState.badgeColorHex).copy(alpha = 0.55f), RoundedCornerShape(24.dp)),
        color = Color(0xFF10192D)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Top Status Row: Active Pose Badge + Plush Texture Thumbnail + Turnaround Switcher
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Image(
                        painter = painterResource(id = R.drawable.img_milo_plush),
                        contentDescription = "마일로 플러시 원본 텍스처",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .border(1.5.dp, FoldCyanPrimary, CircleShape)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "살아 숨 쉬는 마일로 (Milo)",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color(poseState.badgeColorHex).copy(alpha = 0.2f))
                                    .padding(horizontal = 7.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = poseState.titleKo,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color(poseState.badgeColorHex)
                                )
                            }
                        }
                        Text(
                            text = "${poseState.sheetCategory} · 쓰다듬기 ${petCount}회",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Voice Live Mode Button
                FilterChip(
                    selected = isVoiceActive,
                    onClick = onToggleVoiceMode,
                    label = {
                        Text(
                            text = if (isVoiceActive) "Live 음성 중" else "음성 교감",
                            style = MaterialTheme.typography.labelSmall
                        )
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = if (isVoiceActive) Icons.Default.GraphicEq else Icons.Default.Mic,
                            contentDescription = "실시간 음성 교감 토글",
                            modifier = Modifier.size(16.dp)
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = FoldRoseUrgent.copy(alpha = 0.25f),
                        selectedLabelColor = FoldRoseUrgent
                    ),
                    modifier = Modifier.testTag("toggle_milo_voice_chip")
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Interactive 2.5D/3D Procedural Plush Milo Stage
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(235.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.radialGradient(
                            colors = listOf(
                                Color(0xFF1E325C),
                                Color(0xFF0E172A)
                            )
                        )
                    )
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onTap = {
                                localPokeTrigger++
                                onPetMilo()
                            }
                        )
                    }
                    .testTag("living_milo_interactive_canvas"),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val centerX = size.width / 2f
                    val centerY = size.height * 0.54f
                    val baseRadius = size.minDimension * 0.31f

                    // Voice Reactive Aura Rings (like ChatGPT Voice / Gemini Live)
                    if (isVoiceActive) {
                        val waveRadius1 = baseRadius * (1.35f + breathPhase * 0.25f + voiceDecibel * 0.2f)
                        val waveRadius2 = baseRadius * (1.18f + breathPhase * 0.15f)
                        drawCircle(
                            color = FoldCyanPrimary.copy(alpha = 0.14f),
                            radius = waveRadius1,
                            center = Offset(centerX, centerY)
                        )
                        drawCircle(
                            color = MiloSkyBlue.copy(alpha = 0.24f),
                            radius = waveRadius2,
                            center = Offset(centerX, centerY)
                        )
                    }

                    // Soft floor shadow
                    drawOval(
                        color = Color.Black.copy(alpha = 0.35f),
                        topLeft = Offset(centerX - baseRadius * 0.85f, centerY + baseRadius * 0.88f),
                        size = Size(baseRadius * 1.7f, baseRadius * 0.28f)
                    )

                    // Pose-specific background props (Yoga mat, Step box, Tricycle)
                    drawPoseBackgroundProps(
                        poseState = poseState,
                        centerX = centerX,
                        centerY = centerY,
                        baseRadius = baseRadius
                    )

                    // Apply spring squish & breathing scale around Milo's body
                    val squatOffsetY = when (poseState) {
                        MiloPoseState.SQUAT_HOLD -> baseRadius * 0.16f
                        MiloPoseState.STEADY_JOGGING, MiloPoseState.HAPPY_CHEERING -> -breathPhase * 14f
                        else -> -breathPhase * 6f
                    }

                    scale(
                        scaleX = squishScaleX,
                        scaleY = if (poseState == MiloPoseState.SQUAT_HOLD) squishScaleY * 0.88f else squishScaleY,
                        pivot = Offset(centerX, centerY + baseRadius * 0.6f)
                    ) {
                        drawPlushMiloCharacter(
                            poseState = poseState,
                            turnaroundView = turnaroundView,
                            centerX = centerX,
                            centerY = centerY + squatOffsetY,
                            r = baseRadius,
                            tuftAngle = tuftAngle,
                            isSquished = isSquished,
                            isVoiceActive = isVoiceActive,
                            breathPhase = breathPhase
                        )
                    }
                }

                // Top-left Turnaround Pills (Front / Side / Back from milo-basic.jpg)
                Row(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    MiloTurnaroundView.entries.forEach { view ->
                        val active = view == turnaroundView
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(
                                    if (active) FoldCyanPrimary.copy(alpha = 0.28f)
                                    else Color(0x99090D16)
                                )
                                .border(
                                    width = 1.dp,
                                    color = if (active) FoldCyanPrimary else Color.Transparent,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .pointerInput(view) {
                                    detectTapGestures { onSelectTurnaround(view) }
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                .testTag("turnaround_${view.name.lowercase()}")
                        ) {
                            Text(
                                text = view.labelKo,
                                style = MaterialTheme.typography.labelSmall,
                                color = if (active) FoldCyanPrimary else Color.White
                            )
                        }
                    }
                }

                // Bottom-right Touch Hint
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(10.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xAA090D16))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.TouchApp,
                        contentDescription = "터치 인터랙션 안내",
                        tint = FoldAmberTertiary,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "배·볼을 콕 찔러보세요!",
                        style = MaterialTheme.typography.labelSmall,
                        color = FoldAmberTertiary
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Milo Speech Bubble (Empathetic Proactive Quote)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF17253F))
                    .border(1.dp, FoldCyanPrimary.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
                    .padding(12.dp)
                    .testTag("milo_speech_bubble")
            ) {
                Text(
                    text = "💬 마일로: \"${poseState.miloBubbleQuote}\"",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFFE2E8F0)
                )
            }
        }
    }
}

private fun DrawScope.drawPoseBackgroundProps(
    poseState: MiloPoseState,
    centerX: Float,
    centerY: Float,
    baseRadius: Float
) {
    when (poseState) {
        MiloPoseState.YOGA_STRETCHING -> {
            // Rainbow Yoga Mat from milo-excercise-2.jpg
            val matWidth = baseRadius * 2.5f
            val matHeight = baseRadius * 0.34f
            val matTop = centerY + baseRadius * 0.72f
            val stripeColors = listOf(
                Color(0xFF6EE7B7),
                Color(0xFFFCD34D),
                Color(0xFFFCA5A5),
                Color(0xFF93C5FD),
                Color(0xFFC4B5FD)
            )
            val stripeWidth = matWidth / stripeColors.size
            stripeColors.forEachIndexed { idx, color ->
                drawRoundRect(
                    color = color,
                    topLeft = Offset(centerX - matWidth / 2f + idx * stripeWidth, matTop),
                    size = Size(stripeWidth + 2f, matHeight),
                    cornerRadius = CornerRadius(8f, 8f)
                )
            }
        }

        MiloPoseState.STAIR_CLIMBING -> {
            // Colorful Step Box from milo-excercise-2.jpg
            val stepTop = centerY + baseRadius * 0.65f
            drawRoundRect(
                color = Color(0xFFFB7185),
                topLeft = Offset(centerX - baseRadius * 1.1f, stepTop),
                size = Size(baseRadius * 1.2f, baseRadius * 0.38f),
                cornerRadius = CornerRadius(10f, 10f)
            )
            drawRoundRect(
                color = Color(0xFFFBBF24),
                topLeft = Offset(centerX - baseRadius * 0.5f, stepTop - baseRadius * 0.14f),
                size = Size(baseRadius * 1.1f, baseRadius * 0.25f),
                cornerRadius = CornerRadius(8f, 8f)
            )
            drawRoundRect(
                color = Color(0xFF60A5FA),
                topLeft = Offset(centerX - baseRadius * 0.1f, stepTop - baseRadius * 0.28f),
                size = Size(baseRadius * 1.0f, baseRadius * 0.22f),
                cornerRadius = CornerRadius(8f, 8f)
            )
        }

        MiloPoseState.CYCLING -> {
            // Colorful Tricycle wheels under Milo from milo-excercise-2.jpg
            val wheelY = centerY + baseRadius * 0.75f
            drawCircle(
                color = Color(0xFF6366F1),
                radius = baseRadius * 0.28f,
                center = Offset(centerX - baseRadius * 0.55f, wheelY),
                style = Stroke(width = 12f)
            )
            drawCircle(
                color = Color(0xFF34D399),
                radius = baseRadius * 0.24f,
                center = Offset(centerX + baseRadius * 0.55f, wheelY),
                style = Stroke(width = 10f)
            )
            drawLine(
                color = Color(0xFFFBBF24),
                start = Offset(centerX - baseRadius * 0.55f, wheelY),
                end = Offset(centerX, centerY + baseRadius * 0.35f),
                strokeWidth = 10f,
                cap = StrokeCap.Round
            )
        }

        else -> {}
    }
}

private fun DrawScope.drawPlushMiloCharacter(
    poseState: MiloPoseState,
    turnaroundView: MiloTurnaroundView,
    centerX: Float,
    centerY: Float,
    r: Float,
    tuftAngle: Float,
    isSquished: Boolean,
    isVoiceActive: Boolean,
    breathPhase: Float
) {
    val plushBrush = Brush.radialGradient(
        colors = listOf(MiloSkyBlue, MiloPlushBlue, MiloDeepBlue),
        center = Offset(centerX - r * 0.2f, centerY - r * 0.25f),
        radius = r * 1.35f
    )

    // Side or Back cute little tail (from milo-basic.jpg Side/Back view)
    if (turnaroundView == MiloTurnaroundView.SIDE || turnaroundView == MiloTurnaroundView.BACK) {
        val tailOffsetX = if (turnaroundView == MiloTurnaroundView.SIDE) r * 0.75f else 0f
        drawOval(
            color = MiloPlushBlue,
            topLeft = Offset(centerX + tailOffsetX - r * 0.22f, centerY + r * 0.22f),
            size = Size(r * 0.48f, r * 0.36f)
        )
    }

    // Stubby Plush Feet
    val leftFootOffsetY = if (poseState == MiloPoseState.WALKING_CHEERFULLY || poseState == MiloPoseState.STEADY_JOGGING || poseState == MiloPoseState.STAIR_CLIMBING) {
        -sin(breathPhase * 3.14f).toFloat() * r * 0.14f
    } else 0f

    drawOval(
        color = MiloDeepBlue,
        topLeft = Offset(centerX - r * 0.58f, centerY + r * 0.68f + leftFootOffsetY),
        size = Size(r * 0.44f, r * 0.25f)
    )
    drawOval(
        color = MiloDeepBlue,
        topLeft = Offset(centerX + r * 0.14f, centerY + r * 0.68f - leftFootOffsetY),
        size = Size(r * 0.44f, r * 0.25f)
    )

    // Lower Pear-Shaped Chubby Torso
    drawOval(
        brush = plushBrush,
        topLeft = Offset(centerX - r * 0.88f, centerY - r * 0.22f),
        size = Size(r * 1.76f, r * 1.05f)
    )

    // Upper Chubby Head/Cheeks Silhouette
    drawOval(
        brush = plushBrush,
        topLeft = Offset(centerX - r * 0.74f, centerY - r * 0.78f),
        size = Size(r * 1.48f, r * 0.92f)
    )

    // Signature Curved Water-Drop Head Tuft / Antenna (wiggles with voice!)
    rotate(degrees = tuftAngle, pivot = Offset(centerX, centerY - r * 0.75f)) {
        val tuftPath = Path().apply {
            moveTo(centerX - r * 0.12f, centerY - r * 0.72f)
            cubicTo(
                centerX - r * 0.22f, centerY - r * 1.12f,
                centerX + r * 0.28f, centerY - r * 1.15f,
                centerX + r * 0.16f, centerY - r * 0.86f
            )
            close()
        }
        drawPath(path = tuftPath, color = MiloSkyBlue)
    }

    // Soft White Glowing Belly (Visible on Front & Side)
    if (turnaroundView != MiloTurnaroundView.BACK) {
        val bellyShiftX = if (turnaroundView == MiloTurnaroundView.SIDE) -r * 0.25f else 0f
        drawOval(
            brush = Brush.radialGradient(
                colors = listOf(Color.White, MiloBellyCream, MiloSkyBlue.copy(alpha = 0.2f)),
                center = Offset(centerX + bellyShiftX, centerY + r * 0.25f),
                radius = r * 0.58f
            ),
            topLeft = Offset(centerX - r * 0.56f + bellyShiftX, centerY - r * 0.06f),
            size = Size(r * 1.12f, r * 0.76f)
        )
    }

    // Left & Right Chubby Arms (Adjusted by Pose)
    val leftArmAngle = when (poseState) {
        MiloPoseState.HAPPY_CHEERING, MiloPoseState.YOGA_STRETCHING -> -45f
        MiloPoseState.STRENGTH_TRAINING -> -55f
        else -> 20f
    }
    val rightArmAngle = when (poseState) {
        MiloPoseState.HAPPY_CHEERING, MiloPoseState.YOGA_STRETCHING -> 45f
        MiloPoseState.GLP1_ACTION -> 35f
        else -> -25f
    }

    rotate(degrees = leftArmAngle, pivot = Offset(centerX - r * 0.7f, centerY - r * 0.05f)) {
        drawOval(
            color = MiloSkyBlue,
            topLeft = Offset(centerX - r * 1.08f, centerY - r * 0.12f),
            size = Size(r * 0.48f, r * 0.34f)
        )
    }
    rotate(degrees = rightArmAngle, pivot = Offset(centerX + r * 0.7f, centerY - r * 0.05f)) {
        drawOval(
            color = MiloSkyBlue,
            topLeft = Offset(centerX + r * 0.60f, centerY - r * 0.12f),
            size = Size(r * 0.48f, r * 0.34f)
        )
    }

    // Facial Features (when not Back view)
    if (turnaroundView != MiloTurnaroundView.BACK) {
        val faceOffsetX = if (turnaroundView == MiloTurnaroundView.SIDE) -r * 0.28f else 0f

        // Peach Rosy Cheeks
        val cheekAlpha = if (isSquished || isVoiceActive || poseState == MiloPoseState.STEADY_JOGGING) 0.85f else 0.6f
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(MiloCheekPeach.copy(alpha = cheekAlpha), Color.Transparent)
            ),
            radius = r * 0.22f,
            center = Offset(centerX - r * 0.38f + faceOffsetX, centerY - r * 0.24f)
        )
        if (turnaroundView == MiloTurnaroundView.FRONT) {
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(MiloCheekPeach.copy(alpha = cheekAlpha), Color.Transparent)
                ),
                radius = r * 0.22f,
                center = Offset(centerX + r * 0.38f, centerY - r * 0.24f)
            )
        }

        // Shiny Dark Oval Eyes (or Happy Arcs / Peaceful Closed Eyes)
        val eyeY = centerY - r * 0.34f
        val leftEyeX = centerX - r * 0.22f + faceOffsetX
        val rightEyeX = centerX + r * 0.22f + faceOffsetX

        if (poseState == MiloPoseState.HAPPY_CHEERING || poseState == MiloPoseState.YOGA_STRETCHING || isSquished) {
            // Cute curved happy/zen eyes
            drawArc(
                color = Color(0xFF1E293B),
                startAngle = 190f,
                sweepAngle = 160f,
                useCenter = false,
                topLeft = Offset(leftEyeX - r * 0.08f, eyeY - r * 0.05f),
                size = Size(r * 0.16f, r * 0.12f),
                style = Stroke(width = 6f, cap = StrokeCap.Round)
            )
            if (turnaroundView == MiloTurnaroundView.FRONT) {
                drawArc(
                    color = Color(0xFF1E293B),
                    startAngle = 190f,
                    sweepAngle = 160f,
                    useCenter = false,
                    topLeft = Offset(rightEyeX - r * 0.08f, eyeY - r * 0.05f),
                    size = Size(r * 0.16f, r * 0.12f),
                    style = Stroke(width = 6f, cap = StrokeCap.Round)
                )
            }
        } else {
            // Standard glossy oval eyes with white specular highlight
            drawOval(
                color = Color(0xFF162033),
                topLeft = Offset(leftEyeX - r * 0.065f, eyeY - r * 0.09f),
                size = Size(r * 0.13f, r * 0.18f)
            )
            drawCircle(
                color = Color.White,
                radius = r * 0.03f,
                center = Offset(leftEyeX - r * 0.02f, eyeY - r * 0.04f)
            )

            if (turnaroundView == MiloTurnaroundView.FRONT) {
                drawOval(
                    color = Color(0xFF162033),
                    topLeft = Offset(rightEyeX - r * 0.065f, eyeY - r * 0.09f),
                    size = Size(r * 0.13f, r * 0.18f)
                )
                drawCircle(
                    color = Color.White,
                    radius = r * 0.03f,
                    center = Offset(rightEyeX - r * 0.02f, eyeY - r * 0.04f)
                )
            }
        }

        // Eyebrows for Worried or Determined Exercise Poses
        if (poseState == MiloPoseState.SAD_WORRIED) {
            drawLine(
                color = Color(0xFF1E293B),
                start = Offset(leftEyeX - r * 0.08f, eyeY - r * 0.14f),
                end = Offset(leftEyeX + r * 0.06f, eyeY - r * 0.19f),
                strokeWidth = 5f,
                cap = StrokeCap.Round
            )
            drawLine(
                color = Color(0xFF1E293B),
                start = Offset(rightEyeX - r * 0.06f, eyeY - r * 0.19f),
                end = Offset(rightEyeX + r * 0.08f, eyeY - r * 0.14f),
                strokeWidth = 5f,
                cap = StrokeCap.Round
            )
        } else if (poseState == MiloPoseState.STRENGTH_TRAINING || poseState == MiloPoseState.SQUAT_HOLD) {
            drawLine(
                color = Color(0xFF1E293B),
                start = Offset(leftEyeX - r * 0.08f, eyeY - r * 0.18f),
                end = Offset(leftEyeX + r * 0.06f, eyeY - r * 0.13f),
                strokeWidth = 5.5f,
                cap = StrokeCap.Round
            )
            drawLine(
                color = Color(0xFF1E293B),
                start = Offset(rightEyeX - r * 0.06f, eyeY - r * 0.13f),
                end = Offset(rightEyeX + r * 0.08f, eyeY - r * 0.18f),
                strokeWidth = 5.5f,
                cap = StrokeCap.Round
            )
        }

        // Mouth (Smile, Frown, or Open Cheering/Speaking Mouth)
        val mouthY = centerY - r * 0.22f
        if (poseState == MiloPoseState.SAD_WORRIED) {
            drawArc(
                color = Color(0xFF1E293B),
                startAngle = 200f,
                sweepAngle = 140f,
                useCenter = false,
                topLeft = Offset(centerX - r * 0.09f + faceOffsetX, mouthY),
                size = Size(r * 0.18f, r * 0.10f),
                style = Stroke(width = 5f, cap = StrokeCap.Round)
            )
        } else if (isVoiceActive || poseState == MiloPoseState.HAPPY_CHEERING || poseState == MiloPoseState.GLP1_ACTION) {
            drawOval(
                color = Color(0xFFE15B64),
                topLeft = Offset(centerX - r * 0.09f + faceOffsetX, mouthY - r * 0.03f),
                size = Size(r * 0.18f, r * 0.13f + breathPhase * 6f)
            )
        } else {
            drawArc(
                color = Color(0xFF1E293B),
                startAngle = 20f,
                sweepAngle = 140f,
                useCenter = false,
                topLeft = Offset(centerX - r * 0.09f + faceOffsetX, mouthY - r * 0.05f),
                size = Size(r * 0.18f, r * 0.10f),
                style = Stroke(width = 5.5f, cap = StrokeCap.Round)
            )
        }
    }

    // Foreground Props for Specific Poses (from milo-events.jpg & milo-excercise-2.jpg)
    when (poseState) {
        MiloPoseState.GLP1_ACTION -> {
            // Cute Band-Aid on lower abdomen + GLP-1 Injector Pen in right hand!
            drawRoundRect(
                color = Color(0xFFFDE68A),
                topLeft = Offset(centerX + r * 0.14f, centerY + r * 0.25f),
                size = Size(r * 0.28f, r * 0.14f),
                cornerRadius = CornerRadius(8f, 8f)
            )
            // GLP-1 Pen Injector
            drawRoundRect(
                color = Color(0xFFA78BFA),
                topLeft = Offset(centerX + r * 0.78f, centerY - r * 0.35f),
                size = Size(r * 0.20f, r * 0.56f),
                cornerRadius = CornerRadius(10f, 10f)
            )
            drawRoundRect(
                color = Color(0xFF34D399),
                topLeft = Offset(centerX + r * 0.80f, centerY - r * 0.15f),
                size = Size(r * 0.16f, r * 0.18f),
                cornerRadius = CornerRadius(4f, 4f)
            )
        }

        MiloPoseState.MEAL_CHECK -> {
            // Magnifying Glass + Healthy Poke Bowl (from milo-events.jpg)
            drawCircle(
                color = Color(0xFF94A3B8),
                radius = r * 0.18f,
                center = Offset(centerX - r * 0.32f, centerY + r * 0.02f),
                style = Stroke(width = 7f)
            )
            drawLine(
                color = Color(0xFF475569),
                start = Offset(centerX - r * 0.44f, centerY + r * 0.14f),
                end = Offset(centerX - r * 0.56f, centerY + r * 0.28f),
                strokeWidth = 8f,
                cap = StrokeCap.Round
            )
            // Poke Bowl in right hand
            drawArc(
                color = Color(0xFFFBBF24),
                startAngle = 0f,
                sweepAngle = 180f,
                useCenter = true,
                topLeft = Offset(centerX + r * 0.42f, centerY - r * 0.05f),
                size = Size(r * 0.52f, r * 0.38f)
            )
            drawCircle(
                color = Color(0xFFFB7185),
                radius = r * 0.08f,
                center = Offset(centerX + r * 0.60f, centerY + r * 0.02f)
            )
            drawCircle(
                color = Color(0xFF34D399),
                radius = r * 0.08f,
                center = Offset(centerX + r * 0.76f, centerY + r * 0.03f)
            )
        }

        MiloPoseState.SUCCESS_SCALE -> {
            // Pastel Blue Weight Scale next to Milo (from milo-events.jpg)
            val scaleLeft = centerX + r * 0.65f
            val scaleTop = centerY + r * 0.25f
            drawRoundRect(
                color = Color(0xFFBAE6FD),
                topLeft = Offset(scaleLeft, scaleTop),
                size = Size(r * 0.56f, r * 0.56f),
                cornerRadius = CornerRadius(14f, 14f)
            )
            drawRoundRect(
                color = Color(0xFF38BDF8),
                topLeft = Offset(scaleLeft + r * 0.08f, scaleTop + r * 0.08f),
                size = Size(r * 0.40f, r * 0.16f),
                cornerRadius = CornerRadius(6f, 6f)
            )
        }

        MiloPoseState.STRENGTH_TRAINING -> {
            // Pink/Green Dumbbell in left hand (from milo-excercise-2.jpg)
            val dbCenterX = centerX - r * 0.92f
            val dbCenterY = centerY - r * 0.25f
            drawLine(
                color = Color(0xFFFBBF24),
                start = Offset(dbCenterX - r * 0.18f, dbCenterY),
                end = Offset(dbCenterX + r * 0.18f, dbCenterY),
                strokeWidth = 9f
            )
            drawCircle(
                color = Color(0xFFFB7185),
                radius = r * 0.13f,
                center = Offset(dbCenterX - r * 0.20f, dbCenterY)
            )
            drawCircle(
                color = Color(0xFF34D399),
                radius = r * 0.13f,
                center = Offset(dbCenterX + r * 0.20f, dbCenterY)
            )
        }

        else -> {}
    }
}
