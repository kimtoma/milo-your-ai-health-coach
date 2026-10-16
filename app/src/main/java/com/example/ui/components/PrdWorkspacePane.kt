package com.example.ui.components

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.model.MiloChatMessage
import com.example.model.MiloPoseState
import com.example.model.MiloTurnaroundView
import com.example.ui.theme.FoldAmberTertiary
import com.example.ui.theme.FoldCyanPrimary
import com.example.ui.theme.FoldEmeraldSuccess
import com.example.ui.theme.FoldIndigoSecondary

@Composable
fun MiloCompanionLeftPane(
    activePose: MiloPoseState,
    turnaroundView: MiloTurnaroundView,
    isVoiceActive: Boolean,
    voiceDecibel: Float,
    petCount: Int,
    isAiThinking: Boolean,
    chatMessages: List<MiloChatMessage>,
    onPetMilo: () -> Unit,
    onSelectPose: (MiloPoseState) -> Unit,
    onSelectTurnaround: (MiloTurnaroundView) -> Unit,
    onToggleVoiceMode: () -> Unit,
    onSendMessage: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var messageInput by remember { mutableStateOf("") }

    // Runtime permission launcher for RECORD_AUDIO when tapping voice mode
    val micPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { _ ->
        onToggleVoiceMode()
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(12.dp)
            .testTag("milo_companion_left_pane"),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // 1. Living Milo Interactive Stage
        item {
            LivingMiloStageCard(
                poseState = activePose,
                turnaroundView = turnaroundView,
                isVoiceActive = isVoiceActive,
                voiceDecibel = voiceDecibel,
                petCount = petCount,
                onPetMilo = onPetMilo,
                onSelectTurnaround = onSelectTurnaround,
                onToggleVoiceMode = {
                    micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                }
            )
        }

        // 2. Quick Pose Switcher Row (14 Poses from milo-events & milo-excercise sheets)
        item {
            Column {
                Text(
                    text = "마일로 실시간 감정·운동 모션 전환 (14종)",
                    style = MaterialTheme.typography.labelLarge,
                    color = FoldCyanPrimary
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    MiloPoseState.entries.forEach { pose ->
                        val selected = pose == activePose
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    if (selected) Color(pose.badgeColorHex).copy(alpha = 0.25f)
                                    else Color(0xFF17223B)
                                )
                                .border(
                                    width = if (selected) 1.5.dp else 1.dp,
                                    color = if (selected) Color(pose.badgeColorHex) else Color(0xFF2B3B5E),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                .clickable { onSelectPose(pose) }
                                .padding(horizontal = 10.dp, vertical = 7.dp)
                                .testTag("quick_pose_chip_${pose.name.lowercase()}")
                        ) {
                            Text(
                                text = pose.titleKo,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                color = if (selected) Color(pose.badgeColorHex) else Color.White
                            )
                        }
                    }
                }
            }
        }

        // 3. Multimodal Conversation Log with Milo
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = "마일로 대화",
                        tint = FoldCyanPrimary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "마일로와 음성·텍스트 공감 다이어리",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White
                    )
                }
                if (isAiThinking) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(14.dp),
                            strokeWidth = 2.dp,
                            color = FoldCyanPrimary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "마일로가 생각 중...",
                            style = MaterialTheme.typography.labelSmall,
                            color = FoldCyanPrimary
                        )
                    }
                }
            }
        }

        items(chatMessages.takeLast(4), key = { it.id }) { msg ->
            ChatBubbleItem(message = msg)
        }

        // 4. Voice & Text Input Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(
                    onClick = {
                        micPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                    },
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (isVoiceActive) Color(0xFFFB7185).copy(alpha = 0.25f)
                            else Color(0xFF1E293B)
                        )
                        .testTag("chat_mic_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "음성으로 말하기",
                        tint = if (isVoiceActive) Color(0xFFFB7185) else FoldCyanPrimary
                    )
                }

                OutlinedTextField(
                    value = messageInput,
                    onValueChange = { messageInput = it },
                    placeholder = {
                        Text(
                            text = "예: 오늘 아침에 마운자로 5mg 맞았는데 속이 울렁거려",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    },
                    singleLine = true,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("milo_chat_input")
                )

                Button(
                    onClick = {
                        if (messageInput.isNotBlank()) {
                            onSendMessage(messageInput)
                            messageInput = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = FoldCyanPrimary,
                        contentColor = Color(0xFF042F49)
                    ),
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .testTag("milo_chat_send_button")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.Send,
                        contentDescription = "메시지 전송",
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun ChatBubbleItem(message: MiloChatMessage) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (message.senderIsMilo) Alignment.Start else Alignment.End
    ) {
        Box(
            modifier = Modifier
                .clip(
                    RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (message.senderIsMilo) 4.dp else 16.dp,
                        bottomEnd = if (message.senderIsMilo) 16.dp else 4.dp
                    )
                )
                .background(
                    if (message.senderIsMilo) Color(0xFF192742)
                    else FoldCyanPrimary.copy(alpha = 0.22f)
                )
                .border(
                    width = 1.dp,
                    color = if (message.senderIsMilo) FoldIndigoSecondary.copy(alpha = 0.35f)
                    else FoldCyanPrimary.copy(alpha = 0.55f),
                    shape = RoundedCornerShape(16.dp)
                )
                .padding(12.dp)
        ) {
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = if (message.senderIsMilo) "🐾 마일로 (Milo)" else "나 (사용자)",
                        style = MaterialTheme.typography.labelSmall,
                        color = if (message.senderIsMilo) FoldCyanPrimary else FoldAmberTertiary
                    )
                    Text(
                        text = message.timestamp,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = message.text,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White
                )

                if (!message.actionCardText.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(FoldEmeraldSuccess.copy(alpha = 0.16f))
                            .border(1.dp, FoldEmeraldSuccess.copy(alpha = 0.45f), RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "✨ ${message.actionCardText}",
                            style = MaterialTheme.typography.labelSmall,
                            color = FoldEmeraldSuccess
                        )
                    }
                }
            }
        }
    }
}
