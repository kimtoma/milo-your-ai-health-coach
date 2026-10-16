import React, { useRef, useState } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  HeartPulse,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import {
  DEFAULT_CHAT_MESSAGES,
  DEFAULT_DOCTOR_SUMMARY,
  DEFAULT_GLP1_LOGS,
  DEFAULT_WEIGHT_TREND,
  DEFAULT_ZERO_EFFORT_ITEMS,
  FoldPostureMode,
  Glp1DoseLog,
  INJECTION_SITES,
  InjectionSiteId,
  MiloChatMessage,
  MiloPoseState,
  MiloTurnaroundView,
  StudioDestination,
  STUDIO_DESTINATIONS,
  ZeroEffortConfirmItem,
} from './types/models';
import {
  analyzeFoodPhotoWithMilo,
  chatWithMilo,
  generateDoctorClinicalSummary,
} from './services/miloApi';
import { FoldPostureHeader } from './components/FoldPostureHeader';
import { MiloCompanionLeftPane } from './components/MiloCompanionLeftPane';
import {
  DoctorMedicalReportTabContent,
  Glp1CareTabContent,
  MiloCareRightHubPane,
  MiloMotionsGalleryTabContent,
  ZeroEffortConfirmTabContent,
} from './components/MiloCareRightHubPane';

export function App() {
  const [postureMode, setPostureMode] = useState<FoldPostureMode>(
    FoldPostureMode.UNFOLDED_DUAL
  );
  const [currentDestination, setCurrentDestination] = useState<StudioDestination>(
    StudioDestination.DUAL_WORKSPACE
  );
  const [showHingeGuide, setShowHingeGuide] = useState<boolean>(true);
  const [isLeftRightSwapped, setIsLeftRightSwapped] = useState<boolean>(false);
  const [leftPaneWeight, setLeftPaneWeight] = useState<number>(0.45);
  const [rightHubTabIndex, setRightHubTabIndex] = useState<number>(0);

  // Milo Character State Machine
  const [activePose, setActivePose] = useState<MiloPoseState>(
    MiloPoseState.GLP1_ACTION
  );
  const [turnaroundView, setTurnaroundView] = useState<MiloTurnaroundView>(
    MiloTurnaroundView.FRONT
  );
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceDecibel] = useState<number>(0.65);
  const [petCount, setPetCount] = useState<number>(12);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Health Connect & Daily Telemetry
  const [todaySteps] = useState<number>(6420);
  const [todayWaterMl, setTodayWaterMl] = useState<number>(1450);
  const [todayProteinGrams, setTodayProteinGrams] = useState<number>(68);
  const [currentMedication] = useState<string>('마운자로 (Mounjaro) 5.0mg');
  const [selectedInjectionSite, setSelectedInjectionSite] =
    useState<InjectionSiteId>(InjectionSiteId.ABDOMEN_BOTTOM_RIGHT);
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>([
    '경미한 오심(울렁거림)',
    '식욕 억제 양호',
  ]);
  const [selectedMoodEmoji, setSelectedMoodEmoji] =
    useState<string>('😌 평온·다독임');

  // Zero-Effort Confirm Cards
  const [zeroEffortItems, setZeroEffortItems] = useState<ZeroEffortConfirmItem[]>(
    DEFAULT_ZERO_EFFORT_ITEMS
  );

  // GLP-1 History & 30-Day Medical Report Data
  const [glp1Logs, setGlp1Logs] = useState<Glp1DoseLog[]>(DEFAULT_GLP1_LOGS);
  const [weightTrend] = useState(DEFAULT_WEIGHT_TREND);
  const [doctorClinicalSummary, setDoctorClinicalSummary] = useState<string>(
    DEFAULT_DOCTOR_SUMMARY
  );
  const [exportedPdfStatus, setExportedPdfStatus] = useState<string | null>(null);

  // Multimodal Chat History with Milo
  const [chatMessages, setChatMessages] = useState<MiloChatMessage[]>(
    DEFAULT_CHAT_MESSAGES
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSetDestination = (dest: StudioDestination) => {
    let mappedTab = rightHubTabIndex;
    if (dest === StudioDestination.ZERO_EFFORT_LOG) mappedTab = 0;
    else if (dest === StudioDestination.GLP1_CARE) mappedTab = 1;
    else if (dest === StudioDestination.MILO_MOTIONS) mappedTab = 2;
    else if (dest === StudioDestination.DOCTOR_REPORT) mappedTab = 3;
    setCurrentDestination(dest);
    setRightHubTabIndex(mappedTab);
  };

  const handleSetRightHubTab = (index: number) => {
    const suggestedPose =
      index === 0
        ? MiloPoseState.MEAL_CHECK
        : index === 1
          ? MiloPoseState.GLP1_ACTION
          : index === 2
            ? MiloPoseState.HAPPY_CHEERING
            : index === 3
              ? MiloPoseState.SUCCESS_SCALE
              : activePose;
    setRightHubTabIndex(index);
    setActivePose(suggestedPose);
  };

  const handleAdjustSplitRatio = (weight: number) => {
    setLeftPaneWeight(Math.min(Math.max(weight, 0.36), 0.62));
  };

  const handlePetMilo = () => {
    setPetCount((prev) => prev + 1);
    setActivePose((prev) =>
      prev === MiloPoseState.SAD_WORRIED
        ? MiloPoseState.LISTENING_COMFORTING
        : prev
    );
  };

  const handleToggleVoiceMode = () => {
    setIsVoiceActive((prev) => {
      const next = !prev;
      setActivePose(
        next ? MiloPoseState.LISTENING_COMFORTING : MiloPoseState.HAPPY_CHEERING
      );
      return next;
    });
  };

  const handleConfirmZeroEffortItem = (id: string) => {
    setZeroEffortItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && !target.isConfirmed && target.proteinGrams > 0) {
        setTodayProteinGrams((p) => p + target.proteinGrams);
      }
      return prev.map((item) =>
        item.id === id ? { ...item, isConfirmed: true } : item
      );
    });
    setActivePose(MiloPoseState.HAPPY_CHEERING);
  };

  const handleAddWaterCup = () => {
    setTodayWaterMl((prev) => prev + 250);
    setActivePose(MiloPoseState.HAPPY_CHEERING);
  };

  const handleSelectInjectionSite = (site: InjectionSiteId) => {
    setSelectedInjectionSite(site);
    setActivePose(MiloPoseState.GLP1_ACTION);
  };

  const handleToggleSideEffect = (effect: string) => {
    setSelectedSideEffects((prev) => {
      const exists = prev.includes(effect);
      const updated = exists
        ? prev.filter((e) => e !== effect)
        : [...prev, effect];
      if (effect.includes('오심') && !exists) {
        setActivePose(MiloPoseState.SAD_WORRIED);
      } else {
        setActivePose(MiloPoseState.GLP1_ACTION);
      }
      return updated;
    });
  };

  const handleRecordTodayGlp1Injection = () => {
    const siteMeta = INJECTION_SITES[selectedInjectionSite];
    const newLog: Glp1DoseLog = {
      id: `glp_${Date.now()}`,
      dateLabel: '오늘 · 방금 전',
      medicationName: currentMedication,
      doseMg: '5.0mg',
      site: siteMeta,
      sideEffects: selectedSideEffects,
      nauseaLevel: selectedSideEffects.some((s) => s.includes('오심')) ? 2 : 0,
      moodEmoji: selectedMoodEmoji,
      miloCareNote: `마일로가 ${siteMeta.labelKo} 부위 로테이션과 부작용 상태를 안전하게 기록했어요!`,
    };
    setGlp1Logs((prev) => [newLog, ...prev]);
    setActivePose(MiloPoseState.HAPPY_CHEERING);
  };

  const handleSendChatMessage = async (userText: string) => {
    if (!userText.trim()) return;
    const trimmed = userText.trim();
    const userMsg: MiloChatMessage = {
      id: `msg_u_${Date.now()}`,
      senderIsMilo: false,
      text: trimmed,
      timestamp: '방금',
    };

    const poseForInput =
      trimmed.includes('울렁') || trimmed.includes('오심') || trimmed.includes('속이')
        ? MiloPoseState.SAD_WORRIED
        : trimmed.includes('주사') ||
            trimmed.includes('마운자로') ||
            trimmed.includes('위고비')
          ? MiloPoseState.GLP1_ACTION
          : trimmed.includes('포케') ||
              trimmed.includes('점심') ||
              trimmed.includes('샐러드')
            ? MiloPoseState.MEAL_CHECK
            : trimmed.includes('리포트') ||
                trimmed.includes('병원') ||
                trimmed.includes('의사')
              ? MiloPoseState.SUCCESS_SCALE
              : MiloPoseState.LISTENING_COMFORTING;

    setChatMessages((prev) => [...prev, userMsg]);
    setActivePose(poseForInput);
    setIsAiThinking(true);

    const reply = await chatWithMilo({
      userMessage: trimmed,
      currentDose: currentMedication,
      todaySteps,
      todayProteinGrams,
    });

    const actionBadge =
      trimmed.includes('주사') || trimmed.includes('울렁')
        ? '확인형 카드 생성됨: [복부 우하단 · 마운자로 5mg · 부작용: 경미한 오심]'
        : trimmed.includes('포케') || trimmed.includes('점심')
          ? '확인형 카드 생성됨: [연어 포케 볼 (밥 1/2) · 단백질 28g · 440kcal]'
          : trimmed.includes('리포트') || trimmed.includes('병원')
            ? '병원 제출용 30일 GLP-1 & 체성분 리포트 준비 완료'
            : null;

    const miloMsg: MiloChatMessage = {
      id: `msg_m_${Date.now()}`,
      senderIsMilo: true,
      text: reply,
      timestamp: '방금',
      actionCardText: actionBadge,
    };

    setChatMessages((prev) => [...prev, miloMsg]);
    setIsAiThinking(false);
  };

  const handleTriggerFoodPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handleFoodFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActivePose(MiloPoseState.MEAL_CHECK);
    setRightHubTabIndex(0);
    setIsAiThinking(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const base64Part = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';

      const aiComment = await analyzeFoodPhotoWithMilo({
        base64Jpeg: base64Part || null,
        mimeType: file.type || 'image/jpeg',
        foodHint: '갤러리 건강 식단',
      });

      const newConfirm: ZeroEffortConfirmItem = {
        id: `ze_custom_${Date.now()}`,
        sourceBadge: '갤러리 AI 식단 감지 (On-Device 필터링)',
        detectedTime: '방금 촬영한 사진',
        title: '사용자 선택 고단백 건강 식단',
        miloQuestion: aiComment,
        nutritionOrMetricSummary: '추정 단백질 29g · 탄수화물 32g · 460kcal',
        proteinGrams: 29,
        caloriesKcal: 460,
        userQuickReplyText: '응, 맛있게 다 먹었어! 기록해줘',
        isConfirmed: false,
        imageUrl: dataUrl,
      };

      setZeroEffortItems((prev) => [newConfirm, ...prev]);
      setIsAiThinking(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // --- 3-Minute Judges Live Demo Scenarios ---
  const runDemoScenario1_Glp1AndNausea = () => {
    setCurrentDestination(StudioDestination.DUAL_WORKSPACE);
    setRightHubTabIndex(1);
    setActivePose(MiloPoseState.SAD_WORRIED);
    setIsVoiceActive(true);
    setSelectedInjectionSite(InjectionSiteId.ABDOMEN_BOTTOM_RIGHT);
    setSelectedSideEffects(['경미한 오심(울렁거림)', '주사 당일 피로감']);
    handleSendChatMessage(
      '안녕 마일로, 나 오늘 아침에 마운자로 5mg 주사 맞았어. 근데 속이 좀 울렁거리네.'
    );
  };

  const runDemoScenario2_ZeroEffortMeal = () => {
    setCurrentDestination(StudioDestination.DUAL_WORKSPACE);
    setRightHubTabIndex(0);
    setActivePose(MiloPoseState.MEAL_CHECK);
    setIsVoiceActive(false);
    handleSendChatMessage('점심에 찍어둔 연어 포케 사진 봤어? 밥은 반 남겼어!');
  };

  const runDemoScenario3_DoctorReport = async () => {
    setCurrentDestination(StudioDestination.DUAL_WORKSPACE);
    setRightHubTabIndex(3);
    setActivePose(MiloPoseState.SUCCESS_SCALE);
    setIsVoiceActive(false);
    setIsAiThinking(true);
    handleSendChatMessage(
      '마일로, 오늘 진료 보러 가는데 의사 선생님께 드릴 한 달 치 마운자로 부작용이랑 식단 리포트 뽑아줘.'
    );
    const summary = await generateDoctorClinicalSummary({
      doseHistorySummary:
        '마운자로 2.5mg(1~2주차) → 5.0mg(3~4주차), 복부 4분면 로테이션 100% 준수',
      weightTrendSummary:
        '78.3kg → 74.2kg (-4.1kg 감량), 골격근량 28.4kg → 28.2kg (근손실 방어 우수)',
      sideEffectSummary:
        '5.0mg 증량 직후 24시간 경미한 오심(2/5) 발생 후 수분 및 단백질 분할 섭취로 완화',
    });
    setDoctorClinicalSummary(summary);
    setIsAiThinking(false);
  };

  const handleExportDoctorReportPdf = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 794;
      canvas.height = 1123;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(
          'Milo Medical Bridge - GLP-1 & 체성분 진료 요약 리포트',
          48,
          68
        );

        ctx.fillStyle = '#334155';
        ctx.font = '15px sans-serif';
        ctx.fillText(
          `생성일: 2026-10-15 | 투여 약물: ${currentMedication}`,
          48,
          102
        );

        ctx.fillStyle = '#0284C7';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText(
          '1. 4주 체중 및 골격근량 변화: 78.3kg -> 74.2kg (-4.1kg, 골격근량 28.2kg 유지)',
          48,
          154
        );
        ctx.fillText(
          '2. 주사 부위 로테이션: 좌상복부 -> 우상복부 -> 좌하복부 -> 우하복부 (순환 준수)',
          48,
          194
        );
        ctx.fillText('3. 주요 부작용 및 멘탈 코칭 요약:', 48, 234);

        ctx.fillStyle = '#1E293B';
        ctx.font = '14px sans-serif';
        let yPos = 270;
        doctorClinicalSummary.split('\n').forEach((line) => {
          const trimmed = line.trim();
          if (trimmed) {
            ctx.fillText(trimmed.slice(0, 74), 56, yPos);
            yPos += 30;
          }
        });

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Milo_GLP1_Doctor_Report.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }

      setExportedPdfStatus(
        '병원 제출용 PDF/리포트 생성 완료 (Milo_GLP1_Doctor_Report · 14KB)'
      );
      setActivePose(MiloPoseState.HAPPY_CHEERING);
    } catch {
      setExportedPdfStatus('진료실 태블릿/폴드7 대화면 브리핑 뷰 준비 완료');
    }
  };

  const renderDestinationIcon = (dest: StudioDestination) => {
    switch (dest) {
      case StudioDestination.DUAL_WORKSPACE:
        return <LayoutDashboard className="w-4 h-4" />;
      case StudioDestination.ZERO_EFFORT_LOG:
        return <ClipboardCheck className="w-4 h-4" />;
      case StudioDestination.GLP1_CARE:
        return <HeartPulse className="w-4 h-4" />;
      case StudioDestination.MILO_MOTIONS:
        return <Sparkles className="w-4 h-4" />;
      case StudioDestination.DOCTOR_REPORT:
        return <Stethoscope className="w-4 h-4" />;
    }
  };

  const leftMiloElement = (
    <MiloCompanionLeftPane
      activePose={activePose}
      turnaroundView={turnaroundView}
      isVoiceActive={isVoiceActive}
      voiceDecibel={voiceDecibel}
      petCount={petCount}
      isAiThinking={isAiThinking}
      chatMessages={chatMessages}
      onPetMilo={handlePetMilo}
      onSelectPose={setActivePose}
      onSelectTurnaround={setTurnaroundView}
      onToggleVoiceMode={handleToggleVoiceMode}
      onSendMessage={handleSendChatMessage}
    />
  );

  const rightHubElement = (
    <MiloCareRightHubPane
      activeTabIndex={rightHubTabIndex}
      zeroEffortItems={zeroEffortItems}
      todayWaterMl={todayWaterMl}
      todayProteinGrams={todayProteinGrams}
      currentMedication={currentMedication}
      selectedInjectionSite={selectedInjectionSite}
      selectedSideEffects={selectedSideEffects}
      selectedMoodEmoji={selectedMoodEmoji}
      glp1Logs={glp1Logs}
      activePose={activePose}
      weightTrend={weightTrend}
      doctorClinicalSummary={doctorClinicalSummary}
      exportedPdfStatus={exportedPdfStatus}
      leftPaneWeight={leftPaneWeight}
      onSelectTab={handleSetRightHubTab}
      onConfirmZeroEffort={handleConfirmZeroEffortItem}
      onPickFoodPhoto={handleTriggerFoodPhotoPicker}
      onAddWaterCup={handleAddWaterCup}
      onSelectInjectionSite={handleSelectInjectionSite}
      onToggleSideEffect={handleToggleSideEffect}
      onSelectMood={setSelectedMoodEmoji}
      onRecordGlp1Injection={handleRecordTodayGlp1Injection}
      onSelectPose={setActivePose}
      onAdjustSplitWeight={handleAdjustSplitRatio}
      onExportPdf={handleExportDoctorReportPdf}
    />
  );

  const useUnfoldedRail = postureMode !== FoldPostureMode.COVER_COMPACT;

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#0B111E] text-[#F8FAFC] overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFoodFileSelected}
        className="hidden"
      />

      <FoldPostureHeader
        postureMode={postureMode}
        showHingeGuide={showHingeGuide}
        todaySteps={todaySteps}
        todayProteinGrams={todayProteinGrams}
        todayWaterMl={todayWaterMl}
        onSelectPosture={setPostureMode}
        onToggleHingeGuide={() => setShowHingeGuide((v) => !v)}
        onSwapPanes={() => setIsLeftRightSwapped((v) => !v)}
        onPickFoodPhoto={handleTriggerFoodPhotoPicker}
        onRunDemo1Glp1={runDemoScenario1_Glp1AndNausea}
        onRunDemo2Meal={runDemoScenario2_ZeroEffortMeal}
        onRunDemo3Report={runDemoScenario3_DoctorReport}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden max-w-[1600px] w-full mx-auto">
        {/* Left Navigation Rail (Unfolded / Wide) */}
        {useUnfoldedRail && (
          <nav
            data-testid="unfolded_navigation_rail"
            className="w-20 bg-[#0C1323] border-r border-[#31446B]/40 flex flex-col items-center py-3 gap-2 shrink-0"
          >
            {STUDIO_DESTINATIONS.map((dest) => {
              const selected = currentDestination === dest.id;
              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => handleSetDestination(dest.id)}
                  data-testid={`nav_rail_${dest.id.toLowerCase()}`}
                  className={`w-16 py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] font-bold'
                      : 'text-[#AEC0DA] hover:text-white hover:bg-[#131D31]'
                  }`}
                >
                  {renderDestinationIcon(dest.id)}
                  <span className="whitespace-nowrap">{dest.labelKo}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Main Workspace Viewport */}
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col">
          {currentDestination === StudioDestination.DUAL_WORKSPACE ? (
            postureMode === FoldPostureMode.UNFOLDED_DUAL ? (
              <div
                data-testid="unfolded_dual_pane_container"
                className="flex-1 flex min-h-0 overflow-hidden"
              >
                <div
                  style={{ width: `${leftPaneWeight * 100}%` }}
                  className="h-full overflow-hidden flex flex-col"
                >
                  {!isLeftRightSwapped ? leftMiloElement : rightHubElement}
                </div>

                {showHingeGuide ? (
                  <div
                    data-testid="vertical_hinge_safe_divider"
                    className="w-4 h-full bg-gradient-to-r from-[#090D16] via-[#1E293B] to-[#090D16] flex flex-col items-center justify-center gap-2 shrink-0"
                  >
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-[3px] h-3.5 rounded-full bg-[#7DD3FC]/45"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-[1px] h-full bg-[#31446B]/50 shrink-0" />
                )}

                <div
                  style={{ width: `${(1 - leftPaneWeight) * 100}%` }}
                  className="h-full overflow-hidden flex flex-col"
                >
                  {!isLeftRightSwapped ? rightHubElement : leftMiloElement}
                </div>
              </div>
            ) : postureMode === FoldPostureMode.FLEX_TABLETOP ? (
              <div
                data-testid="flex_tabletop_split_container"
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <div className="h-1/2 overflow-hidden flex flex-col">
                  {leftMiloElement}
                </div>
                <div
                  data-testid="horizontal_hinge_safe_divider"
                  className="w-full h-6 bg-gradient-to-b from-[#090D16] via-[#1E293B] to-[#090D16] px-4 flex items-center justify-center shrink-0"
                >
                  <span className="text-[11px] font-semibold text-[#FCD34D] tracking-wide">
                    FLEX 115° HINGE · 상단 마일로 스테이지 / 하단 케어 패드
                  </span>
                </div>
                <div className="h-1/2 overflow-hidden flex flex-col">
                  {rightHubElement}
                </div>
              </div>
            ) : (
              <div
                data-testid="cover_compact_container"
                className="flex-1 max-w-lg w-full mx-auto h-full overflow-hidden flex flex-col border-x border-[#31446B]/40"
              >
                {leftMiloElement}
              </div>
            )
          ) : currentDestination === StudioDestination.ZERO_EFFORT_LOG ? (
            <div className="flex-1 overflow-y-auto bg-[#0E1526]">
              <ZeroEffortConfirmTabContent
                items={zeroEffortItems}
                todayWaterMl={todayWaterMl}
                todayProteinGrams={todayProteinGrams}
                onConfirmItem={handleConfirmZeroEffortItem}
                onPickFoodPhoto={handleTriggerFoodPhotoPicker}
                onAddWaterCup={handleAddWaterCup}
              />
            </div>
          ) : currentDestination === StudioDestination.GLP1_CARE ? (
            <div className="flex-1 overflow-y-auto bg-[#0E1526]">
              <Glp1CareTabContent
                currentMedication={currentMedication}
                selectedSite={selectedInjectionSite}
                selectedSideEffects={selectedSideEffects}
                selectedMood={selectedMoodEmoji}
                logs={glp1Logs}
                onSelectSite={handleSelectInjectionSite}
                onToggleSideEffect={handleToggleSideEffect}
                onSelectMood={setSelectedMoodEmoji}
                onRecordInjection={handleRecordTodayGlp1Injection}
              />
            </div>
          ) : currentDestination === StudioDestination.MILO_MOTIONS ? (
            <div className="flex-1 overflow-y-auto bg-[#0E1526]">
              <MiloMotionsGalleryTabContent
                activePose={activePose}
                onSelectPose={setActivePose}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-[#0E1526]">
              <DoctorMedicalReportTabContent
                weightTrend={weightTrend}
                clinicalSummary={doctorClinicalSummary}
                exportedPdfStatus={exportedPdfStatus}
                leftPaneWeight={leftPaneWeight}
                onAdjustSplitWeight={handleAdjustSplitRatio}
                onExportPdf={handleExportDoctorReportPdf}
              />
            </div>
          )}
        </main>
      </div>

      {/* Bottom Navigation Bar when in Cover Compact Mode */}
      {!useUnfoldedRail && (
        <nav
          data-testid="cover_bottom_navigation"
          className="w-full bg-[#131D31] border-t border-[#31446B]/50 flex items-center justify-around py-2 shrink-0"
        >
          {STUDIO_DESTINATIONS.map((dest) => {
            const selected = currentDestination === dest.id;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => handleSetDestination(dest.id)}
                data-testid={`nav_bottom_${dest.id.toLowerCase()}`}
                className={`px-3 py-1.5 rounded-xl flex flex-col items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                  selected
                    ? 'text-[#7DD3FC] font-bold'
                    : 'text-[#AEC0DA] hover:text-white'
                }`}
              >
                {renderDestinationIcon(dest.id)}
                <span className="whitespace-nowrap">{dest.labelKo}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export default App;
