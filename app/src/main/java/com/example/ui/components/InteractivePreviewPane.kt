package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Healing
import androidx.compose.material.icons.filled.MedicalInformation
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.model.DailyWeightPoint
import com.example.model.Glp1DoseLog
import com.example.model.InjectionSite
import com.example.model.MiloPoseState
import com.example.model.ZeroEffortConfirmItem
import com.example.ui.theme.FoldAmberTertiary
import com.example.ui.theme.FoldCyanPrimary
import com.example.ui.theme.FoldEmeraldSuccess
import com.example.ui.theme.FoldIndigoSecondary
import com.example.ui.theme.FoldRoseUrgent

@Composable
fun MiloCareRightHubPane(
    activeTabIndex: Int,
    zeroEffortItems: List<ZeroEffortConfirmItem>,
    todayWaterMl: Int,
    todayProteinGrams: Int,
    currentMedication: String,
    selectedInjectionSite: InjectionSite,
    selectedSideEffects: Set<String>,
    selectedMoodEmoji: String,
    glp1Logs: List<Glp1DoseLog>,
    activePose: MiloPoseState,
    weightTrend: List<DailyWeightPoint>,
    doctorClinicalSummary: String,
    exportedPdfStatus: String?,
    leftPaneWeight: Float,
    onSelectTab: (Int) -> Unit,
    onConfirmZeroEffort: (String) -> Unit,
    onPickFoodPhoto: () -> Unit,
    onAddWaterCup: () -> Unit,
    onSelectInjectionSite: (InjectionSite) -> Unit,
    onToggleSideEffect: (String) -> Unit,
    onSelectMood: (String) -> Unit,
    onRecordGlp1Injection: () -> Unit,
    onSelectPose: (MiloPoseState) -> Unit,
    onAdjustSplitWeight: (Float) -> Unit,
    onExportPdf: (android.content.Context) -> Unit,
    modifier: Modifier = Modifier
) {
    val tabTitles = listOf("확인형 기록", "GLP-1 케어", "마일로 14종", "병원 리포트")

    Column(modifier = modifier.fillMaxSize()) {
        TabRow(
            selectedTabIndex = activeTabIndex,
            containerColor = Color(0xFF0E1628),
            contentColor = FoldCyanPrimary
        ) {
            tabTitles.forEachIndexed { idx, title ->
                Tab(
                    selected = activeTabIndex == idx,
                    onClick = { onSelectTab(idx) },
                    text = {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = if (activeTabIndex == idx) FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .testTag("right_hub_tab_$idx")
                )
            }
        }

        Box(modifier = Modifier.weight(1f)) {
            when (activeTabIndex) {
                0 -> ZeroEffortConfirmTabContent(
                    items = zeroEffortItems,
                    todayWaterMl = todayWaterMl,
                    todayProteinGrams = todayProteinGrams,
                    onConfirmItem = onConfirmZeroEffort,
                    onPickFoodPhoto = onPickFoodPhoto,
                    onAddWaterCup = onAddWaterCup
                )

                1 -> Glp1CareTabContent(
                    currentMedication = currentMedication,
                    selectedSite = selectedInjectionSite,
                    selectedSideEffects = selectedSideEffects,
                    selectedMood = selectedMoodEmoji,
                    logs = glp1Logs,
                    onSelectSite = onSelectInjectionSite,
                    onToggleSideEffect = onToggleSideEffect,
                    onSelectMood = onSelectMood,
                    onRecordInjection = onRecordGlp1Injection
                )

                2 -> MiloMotionsGalleryTabContent(
                    activePose = activePose,
                    onSelectPose = onSelectPose
                )

                3 -> DoctorMedicalReportTabContent(
                    weightTrend = weightTrend,
                    glp1Logs = glp1Logs,
                    clinicalSummary = doctorClinicalSummary,
                    exportedPdfStatus = exportedPdfStatus,
                    leftPaneWeight = leftPaneWeight,
                    onAdjustSplitWeight = onAdjustSplitWeight,
                    onExportPdf = onExportPdf
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun Glp1CareTabContent(
    currentMedication: String,
    selectedSite: InjectionSite,
    selectedSideEffects: Set<String>,
    selectedMood: String,
    logs: List<Glp1DoseLog>,
    onSelectSite: (InjectionSite) -> Unit,
    onToggleSideEffect: (String) -> Unit,
    onSelectMood: (String) -> Unit,
    onRecordInjection: () -> Unit,
    modifier: Modifier = Modifier
) {
    val sideEffectOptions = listOf(
        "경미한 오심(울렁거림)",
        "식욕 억제 양호",
        "주사 당일 피로감",
        "속쓰림/체기",
        "주사 부위 열감 없음"
    )
    val moodOptions = listOf("😌 평온·다독임", "🥺 속 울렁·지침", "😊 가뿐·활기참", "🍫 스트레스·위로필요")

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(14.dp)
            .testTag("glp1_care_tab_list"),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF162440))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Healing,
                            contentDescription = "GLP-1 로테이션",
                            tint = FoldCyanPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "GLP-1 투여 부위 로테이션 & 부작용 케어",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "현재 처방: $currentMedication · 매주 목요일 오전 투여",
                                style = MaterialTheme.typography.labelSmall,
                                color = FoldCyanPrimary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF0E172A))
                            .padding(10.dp)
                    ) {
                        Text(
                            text = "🐾 마일로 가이드: \"지난주엔 [복부 좌하단]에 맞았으니까, 피부 뭉침 방지를 위해 오늘은 [복부 우하단 ⭐]에 맞을 차례야!\"",
                            style = MaterialTheme.typography.bodyMedium,
                            color = FoldAmberTertiary
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 6-Zone Body Rotation Grid
                    InjectionSite.entries.chunked(2).forEach { rowSites ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            rowSites.forEach { site ->
                                val isSelected = site == selectedSite
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(
                                            if (isSelected) FoldCyanPrimary.copy(alpha = 0.24f)
                                            else Color(0xFF0F182B)
                                        )
                                        .border(
                                            width = if (isSelected) 2.dp else 1.dp,
                                            color = when {
                                                isSelected -> FoldCyanPrimary
                                                site.isRecommendedToday -> FoldAmberTertiary
                                                else -> Color(0xFF2B3B5E)
                                            },
                                            shape = RoundedCornerShape(12.dp)
                                        )
                                        .clickable { onSelectSite(site) }
                                        .padding(10.dp)
                                        .testTag("injection_site_${site.id}")
                                ) {
                                    Column {
                                        Text(
                                            text = site.labelKo,
                                            style = MaterialTheme.typography.labelLarge,
                                            color = if (isSelected) FoldCyanPrimary else Color.White
                                        )
                                        Text(
                                            text = "마지막 투여: ${site.lastUsedDaysAgo}일 전",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "오늘의 주사 후 부작용 문진 (다중 선택)",
                        style = MaterialTheme.typography.labelLarge,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        sideEffectOptions.forEach { effect ->
                            val selected = selectedSideEffects.contains(effect)
                            FilterChip(
                                selected = selected,
                                onClick = { onToggleSideEffect(effect) },
                                label = { Text(effect, style = MaterialTheme.typography.labelSmall) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = FoldRoseUrgent.copy(alpha = 0.22f),
                                    selectedLabelColor = FoldRoseUrgent
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "오늘의 감정 & 멘탈 컨디션",
                        style = MaterialTheme.typography.labelLarge,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        moodOptions.forEach { mood ->
                            val selected = mood == selectedMood
                            FilterChip(
                                selected = selected,
                                onClick = { onSelectMood(mood) },
                                label = { Text(mood, style = MaterialTheme.typography.labelSmall) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = FoldIndigoSecondary.copy(alpha = 0.25f),
                                    selectedLabelColor = FoldIndigoSecondary
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = onRecordInjection,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = FoldCyanPrimary,
                            contentColor = Color(0xFF042F49)
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .minimumInteractiveComponentSize()
                            .testTag("record_glp1_injection_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "주사 및 부작용 기록",
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "[${selectedSite.shortLabel} · 5.0mg] 투여 및 컨디션 기록 완료",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        items(logs, key = { it.id }) { log ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF121C31))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "${log.dateLabel} · ${log.medicationName}",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = log.moodEmoji,
                            style = MaterialTheme.typography.labelLarge,
                            color = FoldAmberTertiary
                        )
                    }
                    Text(
                        text = "투여 부위: ${log.site.labelKo} | 부작용: ${log.sideEffects.joinToString(", ")}",
                        style = MaterialTheme.typography.labelSmall,
                        color = FoldCyanPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "🐾 ${log.miloCareNote}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun DoctorMedicalReportTabContent(
    weightTrend: List<DailyWeightPoint>,
    glp1Logs: List<Glp1DoseLog>,
    clinicalSummary: String,
    exportedPdfStatus: String?,
    leftPaneWeight: Float,
    onAdjustSplitWeight: (Float) -> Unit,
    onExportPdf: (android.content.Context) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(14.dp)
            .testTag("doctor_report_tab_list"),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "🏥 병원 제출용 Medical Bridge 리포트",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White
                    )
                    Text(
                        text = "진료 시 의사 선생님께 폴드 7 대화면으로 바로 보여주거나 PDF로 내보냅니다",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Button(
                    onClick = { onExportPdf(context) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = FoldEmeraldSuccess,
                        contentColor = Color(0xFF042F1E)
                    ),
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .testTag("export_doctor_pdf_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Download,
                        contentDescription = "PDF 리포트 생성",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("PDF 리포트 생성", style = MaterialTheme.typography.labelLarge)
                }
            }
        }

        if (!exportedPdfStatus.isNullOrBlank()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(FoldEmeraldSuccess.copy(alpha = 0.16f))
                        .border(1.dp, FoldEmeraldSuccess, RoundedCornerShape(12.dp))
                        .padding(12.dp)
                        .testTag("pdf_export_status_banner")
                ) {
                    Text(
                        text = exportedPdfStatus,
                        style = MaterialTheme.typography.labelLarge,
                        color = FoldEmeraldSuccess
                    )
                }
            }
        }

        // 4-Week Weight & Skeletal Muscle Preservation Chart Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF15223B))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "📈 최근 4주 체중 감량(-4.1kg) 및 골격근량 방어 추이",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "파란선: 체중(78.3kg → 74.2kg) | 초록선: 골격근량(28.4kg → 28.2kg 유지)",
                        style = MaterialTheme.typography.labelSmall,
                        color = FoldCyanPrimary
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Canvas(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(130.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF0B1324))
                            .padding(16.dp)
                    ) {
                        if (weightTrend.size >= 2) {
                            val stepX = size.width / (weightTrend.size - 1)
                            val weightPath = Path()
                            weightTrend.forEachIndexed { idx, pt ->
                                val x = idx * stepX
                                val normalizedY = ((79.0f - pt.weightKg) / 6.0f).coerceIn(0f, 1f)
                                val y = size.height * (1f - normalizedY)
                                if (idx == 0) weightPath.moveTo(x, y) else weightPath.lineTo(x, y)
                                drawCircle(
                                    color = FoldCyanPrimary,
                                    radius = 8f,
                                    center = Offset(x, y)
                                )
                            }
                            drawPath(
                                path = weightPath,
                                color = FoldCyanPrimary,
                                style = Stroke(width = 5f, cap = StrokeCap.Round)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        weightTrend.forEach { pt ->
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "${pt.weightKg}kg",
                                    style = MaterialTheme.typography.labelLarge,
                                    color = Color.White
                                )
                                Text(
                                    text = "근육 ${pt.skeletalMuscleKg}kg",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = FoldEmeraldSuccess
                                )
                                Text(
                                    text = pt.weekLabel,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }

        // Clinical Summary Card Generated by Argon/Gemini
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF15223B))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.MedicalInformation,
                            contentDescription = "담당의 브리핑 요약",
                            tint = FoldAmberTertiary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "담당 의사 선생님 제출용 AI 임상 요약 (30일 상관관계)",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = clinicalSummary,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFFE2E8F0)
                    )
                }
            }
        }

        // Galaxy Z Fold 7 Split Ratio Controller
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF111B30))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Tune,
                                contentDescription = "폴드7 분할 비율",
                                tint = FoldCyanPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Galaxy Z Fold 7 좌/우 패널 폭 비율 조절",
                                style = MaterialTheme.typography.titleMedium,
                                color = Color.White
                            )
                        }
                        val leftPct = (leftPaneWeight * 100).toInt()
                        Text(
                            text = "마일로 ${leftPct}% : 허브 ${100 - leftPct}%",
                            style = MaterialTheme.typography.labelLarge,
                            color = FoldCyanPrimary
                        )
                    }
                    Slider(
                        value = leftPaneWeight,
                        onValueChange = onAdjustSplitWeight,
                        valueRange = 0.36f..0.62f,
                        colors = SliderDefaults.colors(
                            thumbColor = FoldCyanPrimary,
                            activeTrackColor = FoldCyanPrimary
                        ),
                        modifier = Modifier.testTag("fold_split_ratio_slider")
                    )
                }
            }
        }
    }
}
