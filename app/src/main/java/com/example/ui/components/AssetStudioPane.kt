package com.example.ui.components

import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocalDrink
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.model.MiloPoseState
import com.example.model.ZeroEffortConfirmItem
import com.example.ui.theme.FoldAmberTertiary
import com.example.ui.theme.FoldCyanPrimary
import com.example.ui.theme.FoldEmeraldSuccess
import com.example.ui.theme.FoldIndigoSecondary

@Composable
fun ZeroEffortConfirmTabContent(
    items: List<ZeroEffortConfirmItem>,
    todayWaterMl: Int,
    todayProteinGrams: Int,
    onConfirmItem: (String) -> Unit,
    onPickFoodPhoto: () -> Unit,
    onAddWaterCup: () -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(14.dp)
            .testTag("zero_effort_confirm_list"),
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
                        text = "Zero-Effort 확인형 건강 기록",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White
                    )
                    Text(
                        text = "마일로가 사진첩과 Health Connect를 먼저 읽고 물어봐요 (Human-in-the-loop)",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Button(
                    onClick = onPickFoodPhoto,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = FoldCyanPrimary,
                        contentColor = Color(0xFF042F49)
                    ),
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .testTag("zero_effort_add_photo_btn")
                ) {
                    Icon(
                        imageVector = Icons.Default.AddAPhoto,
                        contentDescription = "식단 사진 추가",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("식단 사진 분석", style = MaterialTheme.typography.labelLarge)
                }
            }
        }

        // Hydration & Protein Guard Card (Essential for GLP-1 Muscle Loss & Side Effect Prevention)
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF15223B))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "🛡️ GLP-1 근손실·탈수 방지 가드",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = FoldCyanPrimary
                        )
                        Text(
                            text = "오늘 단백질 ${todayProteinGrams}g / 목표 80g · 수분 ${todayWaterMl}ml / 목표 2,000ml",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White
                        )
                    }
                    OutlinedButton(
                        onClick = onAddWaterCup,
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .testTag("add_water_cup_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalDrink,
                            contentDescription = "물 250ml 마시기",
                            tint = FoldCyanPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("+250ml", color = FoldCyanPrimary)
                    }
                }
            }
        }

        items(items, key = { it.id }) { item ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .border(
                        width = if (item.isConfirmed) 1.dp else 2.dp,
                        color = if (item.isConfirmed) FoldEmeraldSuccess.copy(alpha = 0.5f) else FoldAmberTertiary,
                        shape = RoundedCornerShape(18.dp)
                    )
                    .testTag("confirm_card_${item.id}"),
                colors = CardDefaults.cardColors(
                    containerColor = if (item.isConfirmed) Color(0xFF111C30) else Color(0xFF182642)
                )
            ) {
                Column {
                    if (item.imageResId != null || !item.customImageUri.isNullOrBlank()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(165.dp)
                                .background(Color(0xFF0A111F))
                        ) {
                            if (item.imageResId != null) {
                                Image(
                                    painter = painterResource(id = item.imageResId),
                                    contentDescription = item.title,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else if (!item.customImageUri.isNullOrBlank()) {
                                AsyncImage(
                                    model = Uri.parse(item.customImageUri),
                                    contentDescription = item.title,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .padding(10.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xD9090D16))
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = item.sourceBadge,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = FoldCyanPrimary
                                )
                            }
                        }
                    }

                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = item.title,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                            Text(
                                text = item.detectedTime,
                                style = MaterialTheme.typography.labelSmall,
                                color = FoldIndigoSecondary
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF0E172A))
                                .padding(10.dp)
                        ) {
                            Text(
                                text = "🐾 마일로: \"${item.miloQuestion}\"",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color(0xFFE2E8F0)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = item.nutritionOrMetricSummary,
                            style = MaterialTheme.typography.labelLarge,
                            color = FoldAmberTertiary
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        if (item.isConfirmed) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(FoldEmeraldSuccess.copy(alpha = 0.16f))
                                    .padding(horizontal = 12.dp, vertical = 8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Verified,
                                    contentDescription = "승인 완료",
                                    tint = FoldEmeraldSuccess,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "사용자 확인 완료 · 건강 일기에 반영됨",
                                    style = MaterialTheme.typography.labelLarge,
                                    color = FoldEmeraldSuccess
                                )
                            }
                        } else {
                            Button(
                                onClick = { onConfirmItem(item.id) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = FoldEmeraldSuccess,
                                    contentColor = Color(0xFF042F1E)
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .minimumInteractiveComponentSize()
                                    .testTag("confirm_action_btn_${item.id}")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = "확인 및 기록 승인",
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "\"${item.userQuickReplyText}\" (원터치 승인)",
                                    style = MaterialTheme.typography.labelLarge,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MiloMotionsGalleryTabContent(
    activePose: MiloPoseState,
    onSelectPose: (MiloPoseState) -> Unit,
    modifier: Modifier = Modifier
) {
    val grouped = MiloPoseState.entries.groupBy { it.sheetCategory }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(14.dp)
            .testTag("milo_motions_gallery_list"),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "마일로 캐릭터 시트 14종 상태 머신",
                style = MaterialTheme.typography.titleLarge,
                color = Color.White
            )
            Text(
                text = "첨부된 5장의 캐릭터 리소스(Events 6종 · Exercise 1 4종 · Exercise 2 4종)를 터치하면 좌측 마일로 스테이지가 즉시 반응합니다.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        grouped.forEach { (category, poses) ->
            item {
                Text(
                    text = category,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = FoldCyanPrimary
                )
            }

            items(poses.chunked(2)) { pair ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    pair.forEach { pose ->
                        val selected = pose == activePose
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(16.dp))
                                .border(
                                    width = if (selected) 2.dp else 1.dp,
                                    color = if (selected) Color(pose.badgeColorHex) else Color(0xFF2B3B5E),
                                    shape = RoundedCornerShape(16.dp)
                                )
                                .clickable { onSelectPose(pose) }
                                .testTag("motion_card_${pose.name.lowercase()}"),
                            colors = CardDefaults.cardColors(
                                containerColor = if (selected) Color(0xFF1B2B4B) else Color(0xFF121D33)
                            )
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = pose.titleKo,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(pose.badgeColorHex)
                                    )
                                    if (selected) {
                                        Text(
                                            text = "● 재생 중",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = FoldEmeraldSuccess
                                        )
                                    }
                                }
                                Text(
                                    text = pose.titleEn,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = pose.miloBubbleQuote,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFFCBD5E1),
                                    maxLines = 2
                                )
                            }
                        }
                    }
                    if (pair.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}
