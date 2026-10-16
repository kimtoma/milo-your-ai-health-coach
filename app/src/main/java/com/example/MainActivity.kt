package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Animation
import androidx.compose.material.icons.filled.DashboardCustomize
import androidx.compose.material.icons.filled.FactCheck
import androidx.compose.material.icons.filled.Healing
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.model.FoldPostureMode
import com.example.model.StudioDestination
import com.example.ui.components.DoctorMedicalReportTabContent
import com.example.ui.components.FoldPostureHeader
import com.example.ui.components.Glp1CareTabContent
import com.example.ui.components.MiloCareRightHubPane
import com.example.ui.components.MiloCompanionLeftPane
import com.example.ui.components.MiloMotionsGalleryTabContent
import com.example.ui.components.ZeroEffortConfirmTabContent
import com.example.ui.theme.FoldAmberTertiary
import com.example.ui.theme.FoldCyanPrimary
import com.example.ui.theme.MyApplicationTheme
import com.example.viewmodel.FoldStudioUiState
import com.example.viewmodel.FoldStudioViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MiloFoldApp()
            }
        }
    }
}

@Composable
fun MiloFoldApp(
    viewModel: FoldStudioViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    // Zero-permission Android Photo Picker for food gallery detection
    val foodPhotoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            viewModel.onCustomFoodPhotoPicked(uri.toString())
        }
    }

    // BackHandler returns to Dual Workspace from single-category destinations
    BackHandler(enabled = uiState.currentDestination != StudioDestination.DUAL_WORKSPACE) {
        viewModel.setDestination(StudioDestination.DUAL_WORKSPACE)
    }

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        val isWideViewport = maxWidth >= 600.dp
        val useUnfoldedRail = uiState.postureMode == FoldPostureMode.UNFOLDED_DUAL || isWideViewport

        Scaffold(
            topBar = {
                FoldPostureHeader(
                    postureMode = uiState.postureMode,
                    showHingeGuide = uiState.showHingeGuide,
                    todaySteps = uiState.todaySteps,
                    todayProteinGrams = uiState.todayProteinGrams,
                    todayWaterMl = uiState.todayWaterMl,
                    onSelectPosture = viewModel::setPostureMode,
                    onToggleHingeGuide = viewModel::toggleHingeGuide,
                    onSwapPanes = viewModel::swapPanes,
                    onPickFoodPhoto = {
                        foodPhotoPickerLauncher.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                        )
                    },
                    onRunDemo1Glp1 = viewModel::runDemoScenario1_Glp1AndNausea,
                    onRunDemo2Meal = viewModel::runDemoScenario2_ZeroEffortMeal,
                    onRunDemo3Report = viewModel::runDemoScenario3_DoctorReport
                )
            },
            bottomBar = {
                if (!useUnfoldedRail) {
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.surface,
                        modifier = Modifier.testTag("cover_bottom_navigation")
                    ) {
                        StudioDestination.entries.forEach { dest ->
                            NavigationBarItem(
                                selected = uiState.currentDestination == dest,
                                onClick = { viewModel.setDestination(dest) },
                                icon = {
                                    Icon(
                                        imageVector = destinationIcon(dest),
                                        contentDescription = dest.labelKo
                                    )
                                },
                                label = {
                                    Text(
                                        text = dest.labelKo,
                                        style = MaterialTheme.typography.labelSmall
                                    )
                                },
                                modifier = Modifier.testTag("nav_bottom_${dest.name.lowercase()}")
                            )
                        }
                    }
                }
            }
        ) { innerPadding ->
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                if (useUnfoldedRail) {
                    NavigationRail(
                        containerColor = Color(0xFF0C1323),
                        modifier = Modifier
                            .fillMaxHeight()
                            .border(
                                width = 1.dp,
                                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)
                            )
                            .testTag("unfolded_navigation_rail")
                    ) {
                        Spacer(modifier = Modifier.height(8.dp))
                        StudioDestination.entries.forEach { dest ->
                            NavigationRailItem(
                                selected = uiState.currentDestination == dest,
                                onClick = { viewModel.setDestination(dest) },
                                icon = {
                                    Icon(
                                        imageVector = destinationIcon(dest),
                                        contentDescription = dest.labelKo
                                    )
                                },
                                label = {
                                    Text(
                                        text = dest.labelKo,
                                        style = MaterialTheme.typography.labelSmall
                                    )
                                },
                                modifier = Modifier
                                    .padding(vertical = 4.dp)
                                    .testTag("nav_rail_${dest.name.lowercase()}")
                            )
                        }
                    }
                }

                Box(modifier = Modifier.fillMaxSize()) {
                    when (uiState.currentDestination) {
                        StudioDestination.DUAL_WORKSPACE -> {
                            MiloDualWorkspaceScreen(
                                uiState = uiState,
                                viewModel = viewModel,
                                onPickFoodPhoto = {
                                    foodPhotoPickerLauncher.launch(
                                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                    )
                                }
                            )
                        }

                        StudioDestination.ZERO_EFFORT_LOG -> {
                            ZeroEffortConfirmTabContent(
                                items = uiState.zeroEffortItems,
                                todayWaterMl = uiState.todayWaterMl,
                                todayProteinGrams = uiState.todayProteinGrams,
                                onConfirmItem = viewModel::confirmZeroEffortItem,
                                onPickFoodPhoto = {
                                    foodPhotoPickerLauncher.launch(
                                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                    )
                                },
                                onAddWaterCup = viewModel::addWaterCup
                            )
                        }

                        StudioDestination.GLP1_CARE -> {
                            Glp1CareTabContent(
                                currentMedication = uiState.currentMedication,
                                selectedSite = uiState.selectedInjectionSite,
                                selectedSideEffects = uiState.selectedSideEffects,
                                selectedMood = uiState.selectedMoodEmoji,
                                logs = uiState.glp1Logs,
                                onSelectSite = viewModel::selectInjectionSite,
                                onToggleSideEffect = viewModel::toggleSideEffect,
                                onSelectMood = viewModel::selectMoodEmoji,
                                onRecordInjection = viewModel::recordTodayGlp1Injection
                            )
                        }

                        StudioDestination.MILO_MOTIONS -> {
                            MiloMotionsGalleryTabContent(
                                activePose = uiState.activePose,
                                onSelectPose = viewModel::selectPose
                            )
                        }

                        StudioDestination.DOCTOR_REPORT -> {
                            DoctorMedicalReportTabContent(
                                weightTrend = uiState.weightTrend,
                                glp1Logs = uiState.glp1Logs,
                                clinicalSummary = uiState.doctorClinicalSummary,
                                exportedPdfStatus = uiState.exportedPdfStatus,
                                leftPaneWeight = uiState.leftPaneWeight,
                                onAdjustSplitWeight = viewModel::adjustSplitRatio,
                                onExportPdf = viewModel::exportDoctorReportPdf
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MiloDualWorkspaceScreen(
    uiState: FoldStudioUiState,
    viewModel: FoldStudioViewModel,
    onPickFoodPhoto: () -> Unit
) {
    val leftMiloPane: @Composable (Modifier) -> Unit = { mod ->
        Surface(
            modifier = mod,
            color = MaterialTheme.colorScheme.background
        ) {
            MiloCompanionLeftPane(
                activePose = uiState.activePose,
                turnaroundView = uiState.turnaroundView,
                isVoiceActive = uiState.isVoiceActive,
                voiceDecibel = uiState.voiceDecibel,
                petCount = uiState.petCount,
                isAiThinking = uiState.isAiThinking,
                chatMessages = uiState.chatMessages,
                onPetMilo = viewModel::petMilo,
                onSelectPose = viewModel::selectPose,
                onSelectTurnaround = viewModel::selectTurnaround,
                onToggleVoiceMode = viewModel::toggleVoiceMode,
                onSendMessage = viewModel::sendChatMessage
            )
        }
    }

    val rightHubPane: @Composable (Modifier) -> Unit = { mod ->
        Surface(
            modifier = mod,
            color = Color(0xFF0E1526)
        ) {
            MiloCareRightHubPane(
                activeTabIndex = uiState.rightHubTabIndex,
                zeroEffortItems = uiState.zeroEffortItems,
                todayWaterMl = uiState.todayWaterMl,
                todayProteinGrams = uiState.todayProteinGrams,
                currentMedication = uiState.currentMedication,
                selectedInjectionSite = uiState.selectedInjectionSite,
                selectedSideEffects = uiState.selectedSideEffects,
                selectedMoodEmoji = uiState.selectedMoodEmoji,
                glp1Logs = uiState.glp1Logs,
                activePose = uiState.activePose,
                weightTrend = uiState.weightTrend,
                doctorClinicalSummary = uiState.doctorClinicalSummary,
                exportedPdfStatus = uiState.exportedPdfStatus,
                leftPaneWeight = uiState.leftPaneWeight,
                onSelectTab = viewModel::setRightHubTab,
                onConfirmZeroEffort = viewModel::confirmZeroEffortItem,
                onPickFoodPhoto = onPickFoodPhoto,
                onAddWaterCup = viewModel::addWaterCup,
                onSelectInjectionSite = viewModel::selectInjectionSite,
                onToggleSideEffect = viewModel::toggleSideEffect,
                onSelectMood = viewModel::selectMoodEmoji,
                onRecordGlp1Injection = viewModel::recordTodayGlp1Injection,
                onSelectPose = viewModel::selectPose,
                onAdjustSplitWeight = viewModel::adjustSplitRatio,
                onExportPdf = viewModel::exportDoctorReportPdf
            )
        }
    }

    when (uiState.postureMode) {
        FoldPostureMode.UNFOLDED_DUAL -> {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("unfolded_dual_pane_container")
            ) {
                val firstWeight = uiState.leftPaneWeight
                val secondWeight = 1f - firstWeight

                if (!uiState.isLeftRightSwapped) {
                    leftMiloPane(Modifier.weight(firstWeight).fillMaxHeight())
                } else {
                    rightHubPane(Modifier.weight(firstWeight).fillMaxHeight())
                }

                if (uiState.showHingeGuide) {
                    VerticalHingeSafeDivider()
                } else {
                    Box(
                        modifier = Modifier
                            .width(1.dp)
                            .fillMaxHeight()
                            .background(MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                    )
                }

                if (!uiState.isLeftRightSwapped) {
                    rightHubPane(Modifier.weight(secondWeight).fillMaxHeight())
                } else {
                    leftMiloPane(Modifier.weight(secondWeight).fillMaxHeight())
                }
            }
        }

        FoldPostureMode.FLEX_TABLETOP -> {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("flex_tabletop_split_container")
            ) {
                leftMiloPane(Modifier.weight(0.50f).fillMaxWidth())
                HorizontalHingeSafeDivider()
                rightHubPane(Modifier.weight(0.50f).fillMaxWidth())
            }
        }

        FoldPostureMode.COVER_COMPACT -> {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("cover_compact_container")
            ) {
                leftMiloPane(Modifier.fillMaxSize())
            }
        }
    }
}

@Composable
private fun VerticalHingeSafeDivider() {
    Box(
        modifier = Modifier
            .width(16.dp)
            .fillMaxHeight()
            .background(
                Brush.horizontalGradient(
                    colors = listOf(
                        Color(0xFF090D16),
                        Color(0xFF1E293B),
                        Color(0xFF090D16)
                    )
                )
            )
            .testTag("vertical_hinge_safe_divider"),
        contentAlignment = Alignment.Center
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            repeat(6) {
                Box(
                    modifier = Modifier
                        .size(width = 3.dp, height = 14.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(FoldCyanPrimary.copy(alpha = 0.45f))
                )
            }
        }
    }
}

@Composable
private fun HorizontalHingeSafeDivider() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(22.dp)
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF090D16),
                        Color(0xFF1E293B),
                        Color(0xFF090D16)
                    )
                )
            )
            .padding(horizontal = 16.dp)
            .testTag("horizontal_hinge_safe_divider"),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(6.dp)
                .clip(CircleShape)
                .background(FoldAmberTertiary)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "FLEX 115° HINGE · 상단 마일로 스테이지 / 하단 케어 패드",
            style = MaterialTheme.typography.labelSmall,
            color = FoldAmberTertiary
        )
    }
}

private fun destinationIcon(destination: StudioDestination): ImageVector =
    when (destination) {
        StudioDestination.DUAL_WORKSPACE -> Icons.Default.DashboardCustomize
        StudioDestination.ZERO_EFFORT_LOG -> Icons.Default.FactCheck
        StudioDestination.GLP1_CARE -> Icons.Default.Healing
        StudioDestination.MILO_MOTIONS -> Icons.Default.Animation
        StudioDestination.DOCTOR_REPORT -> Icons.Default.MedicalServices
    }
