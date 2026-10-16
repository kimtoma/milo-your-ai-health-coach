package com.example.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.PlayCircleFilled
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.ViewSidebar
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.model.FoldPostureMode
import com.example.ui.theme.FoldAmberTertiary
import com.example.ui.theme.FoldCyanPrimary
import com.example.ui.theme.FoldEmeraldSuccess
import com.example.ui.theme.FoldIndigoSecondary
import com.example.ui.theme.FoldRoseUrgent

@Composable
fun FoldPostureHeader(
    postureMode: FoldPostureMode,
    showHingeGuide: Boolean,
    todaySteps: Int,
    todayProteinGrams: Int,
    todayWaterMl: Int,
    onSelectPosture: (FoldPostureMode) -> Unit,
    onToggleHingeGuide: () -> Unit,
    onSwapPanes: () -> Unit,
    onPickFoodPhoto: () -> Unit,
    onRunDemo1Glp1: () -> Unit,
    onRunDemo2Meal: () -> Unit,
    onRunDemo3Report: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 4.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF0E1729),
                            Color(0xFF15233E),
                            Color(0xFF0E1729)
                        )
                    )
                )
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            // Top Row: Milo Brand Identity + Real-time Health Connect Pills
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.img_milo_plush),
                        contentDescription = "마일로 앱 아이콘",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .border(1.5.dp, FoldCyanPrimary, RoundedCornerShape(12.dp))
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Milo (마일로)",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(FoldCyanPrimary.copy(alpha = 0.18f))
                                    .border(1.dp, FoldCyanPrimary.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "Z Fold 7 · ${postureMode.ratioLabel}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = FoldCyanPrimary
                                )
                            }
                        }
                        Text(
                            text = "가장 게으른 방식으로 쓰는 가장 완벽한 GLP-1 & 멘탈 건강 일기",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                // Live Telemetry Badges (Steps, Protein, Water)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TelemetryPill(label = "👣 ${todaySteps}보", color = FoldEmeraldSuccess)
                    TelemetryPill(label = "🥩 단백질 ${todayProteinGrams}g", color = FoldAmberTertiary)
                    TelemetryPill(label = "💧 ${todayWaterMl}ml", color = FoldCyanPrimary)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Second Row: 3-Minute Judges Live Demo Triggers + Galaxy Z Fold 7 Posture Switcher
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // 3-Minute Judges Demo Scenario Buttons
                AssistChip(
                    onClick = onRunDemo1Glp1,
                    label = { Text("🎬 데모1: 주사·오심 공감", style = MaterialTheme.typography.labelLarge) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.PlayCircleFilled,
                            contentDescription = "데모 1 실행",
                            tint = FoldRoseUrgent,
                            modifier = Modifier.size(16.dp)
                        )
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = FoldRoseUrgent.copy(alpha = 0.14f)
                    ),
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .testTag("demo_scenario_1_button")
                )

                AssistChip(
                    onClick = onRunDemo2Meal,
                    label = { Text("🎬 데모2: 연어포케 자동감지", style = MaterialTheme.typography.labelLarge) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Restaurant,
                            contentDescription = "데모 2 실행",
                            tint = FoldAmberTertiary,
                            modifier = Modifier.size(16.dp)
                        )
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = FoldAmberTertiary.copy(alpha = 0.14f)
                    ),
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .testTag("demo_scenario_2_button")
                )

                AssistChip(
                    onClick = onRunDemo3Report,
                    label = { Text("🎬 데모3: 병원용 PDF 자율생성", style = MaterialTheme.typography.labelLarge) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.MedicalServices,
                            contentDescription = "데모 3 실행",
                            tint = FoldEmeraldSuccess,
                            modifier = Modifier.size(16.dp)
                        )
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = FoldEmeraldSuccess.copy(alpha = 0.14f)
                    ),
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .testTag("demo_scenario_3_button")
                )

                AssistChip(
                    onClick = onPickFoodPhoto,
                    label = { Text("식단 사진 추가", style = MaterialTheme.typography.labelLarge) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.AddAPhoto,
                            contentDescription = "식단 사진 추가",
                            tint = FoldIndigoSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = FoldIndigoSecondary.copy(alpha = 0.15f)
                    ),
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .testTag("pick_food_photo_button")
                )

                // Fold 7 Posture Switcher Chips
                FoldPostureMode.entries.forEach { mode ->
                    val selected = mode == postureMode
                    FilterChip(
                        selected = selected,
                        onClick = { onSelectPosture(mode) },
                        label = { Text(mode.titleKo, style = MaterialTheme.typography.labelLarge) },
                        leadingIcon = {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(if (selected) FoldCyanPrimary else Color.Gray)
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = FoldCyanPrimary.copy(alpha = 0.2f),
                            selectedLabelColor = FoldCyanPrimary
                        ),
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .testTag("posture_chip_${mode.name.lowercase()}")
                    )
                }

                if (postureMode == FoldPostureMode.UNFOLDED_DUAL) {
                    AssistChip(
                        onClick = onSwapPanes,
                        label = { Text("좌우 스왑", style = MaterialTheme.typography.labelLarge) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.SwapHoriz,
                                contentDescription = "좌우 패널 스왑",
                                modifier = Modifier.size(16.dp)
                            )
                        },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .testTag("swap_panes_button")
                    )

                    FilterChip(
                        selected = showHingeGuide,
                        onClick = onToggleHingeGuide,
                        label = { Text("힌지 가이드", style = MaterialTheme.typography.labelLarge) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.ViewSidebar,
                                contentDescription = "힌지 안전영역 가이드",
                                modifier = Modifier.size(16.dp)
                            )
                        },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .testTag("toggle_hinge_guide_button")
                    )
                }
            }
        }
    }
}

@Composable
private fun TelemetryPill(label: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(color.copy(alpha = 0.14f))
            .border(1.dp, color.copy(alpha = 0.45f), RoundedCornerShape(16.dp))
            .padding(horizontal = 9.dp, vertical = 4.dp)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = color
        )
    }
}
