import React, { useEffect, useRef } from 'react';
import {
  Camera,
  CheckCircle2,
  Download,
  Droplets,
  HeartPulse,
  SlidersHorizontal,
  Stethoscope,
  BadgeCheck,
} from 'lucide-react';
import {
  DailyWeightPoint,
  Glp1DoseLog,
  InjectionSiteId,
  INJECTION_SITE_LIST,
  MiloPoseState,
  MILO_POSE_LIST,
  ZeroEffortConfirmItem,
} from '../types/models';

interface MiloCareRightHubPaneProps {
  activeTabIndex: number;
  zeroEffortItems: ZeroEffortConfirmItem[];
  todayWaterMl: number;
  todayProteinGrams: number;
  currentMedication: string;
  selectedInjectionSite: InjectionSiteId;
  selectedSideEffects: string[];
  selectedMoodEmoji: string;
  glp1Logs: Glp1DoseLog[];
  activePose: MiloPoseState;
  weightTrend: DailyWeightPoint[];
  doctorClinicalSummary: string;
  exportedPdfStatus: string | null;
  leftPaneWeight: number;
  onSelectTab: (index: number) => void;
  onConfirmZeroEffort: (id: string) => void;
  onPickFoodPhoto: () => void;
  onAddWaterCup: () => void;
  onSelectInjectionSite: (site: InjectionSiteId) => void;
  onToggleSideEffect: (effect: string) => void;
  onSelectMood: (mood: string) => void;
  onRecordGlp1Injection: () => void;
  onSelectPose: (pose: MiloPoseState) => void;
  onAdjustSplitWeight: (weight: number) => void;
  onExportPdf: () => void;
}

const TAB_TITLES = ['확인형 기록', 'GLP-1 케어', '마일로 14종', '병원 리포트'];

export const MiloCareRightHubPane: React.FC<MiloCareRightHubPaneProps> = ({
  activeTabIndex,
  zeroEffortItems,
  todayWaterMl,
  todayProteinGrams,
  currentMedication,
  selectedInjectionSite,
  selectedSideEffects,
  selectedMoodEmoji,
  glp1Logs,
  activePose,
  weightTrend,
  doctorClinicalSummary,
  exportedPdfStatus,
  leftPaneWeight,
  onSelectTab,
  onConfirmZeroEffort,
  onPickFoodPhoto,
  onAddWaterCup,
  onSelectInjectionSite,
  onToggleSideEffect,
  onSelectMood,
  onRecordGlp1Injection,
  onSelectPose,
  onAdjustSplitWeight,
  onExportPdf,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0E1526]">
      {/* Tab Bar */}
      <div className="grid grid-cols-4 bg-[#0E1628] border-b border-[#31446B]/60 px-2 pt-1.5 shrink-0">
        {TAB_TITLES.map((title, idx) => {
          const selected = activeTabIndex === idx;
          return (
            <button
              key={title}
              type="button"
              onClick={() => onSelectTab(idx)}
              data-testid={`right_hub_tab_${idx}`}
              className={`py-2.5 text-xs border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                selected
                  ? 'border-[#7DD3FC] text-[#7DD3FC] font-bold'
                  : 'border-transparent text-[#AEC0DA] hover:text-white font-medium'
              }`}
            >
              {title}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTabIndex === 0 && (
          <ZeroEffortConfirmTabContent
            items={zeroEffortItems}
            todayWaterMl={todayWaterMl}
            todayProteinGrams={todayProteinGrams}
            onConfirmItem={onConfirmZeroEffort}
            onPickFoodPhoto={onPickFoodPhoto}
            onAddWaterCup={onAddWaterCup}
          />
        )}
        {activeTabIndex === 1 && (
          <Glp1CareTabContent
            currentMedication={currentMedication}
            selectedSite={selectedInjectionSite}
            selectedSideEffects={selectedSideEffects}
            selectedMood={selectedMoodEmoji}
            logs={glp1Logs}
            onSelectSite={onSelectInjectionSite}
            onToggleSideEffect={onToggleSideEffect}
            onSelectMood={onSelectMood}
            onRecordInjection={onRecordGlp1Injection}
          />
        )}
        {activeTabIndex === 2 && (
          <MiloMotionsGalleryTabContent
            activePose={activePose}
            onSelectPose={onSelectPose}
          />
        )}
        {activeTabIndex === 3 && (
          <DoctorMedicalReportTabContent
            weightTrend={weightTrend}
            clinicalSummary={doctorClinicalSummary}
            exportedPdfStatus={exportedPdfStatus}
            leftPaneWeight={leftPaneWeight}
            onAdjustSplitWeight={onAdjustSplitWeight}
            onExportPdf={onExportPdf}
          />
        )}
      </div>
    </div>
  );
};

interface ZeroEffortConfirmTabContentProps {
  items: ZeroEffortConfirmItem[];
  todayWaterMl: number;
  todayProteinGrams: number;
  onConfirmItem: (id: string) => void;
  onPickFoodPhoto: () => void;
  onAddWaterCup: () => void;
}

export const ZeroEffortConfirmTabContent: React.FC<ZeroEffortConfirmTabContentProps> = ({
  items,
  todayWaterMl,
  todayProteinGrams,
  onConfirmItem,
  onPickFoodPhoto,
  onAddWaterCup,
}) => {
  return (
    <div
      data-testid="zero_effort_confirm_list"
      className="flex flex-col gap-3.5 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            Zero-Effort 확인형 건강 기록
          </h2>
          <p className="text-xs text-[#AEC0DA]">
            마일로가 사진첩과 Health Connect를 먼저 읽고 물어봐요 (Human-in-the-loop)
          </p>
        </div>
        <button
          type="button"
          onClick={onPickFoodPhoto}
          data-testid="zero_effort_add_photo_btn"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7DD3FC] hover:bg-[#38BDF8] text-[#042F49] font-bold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>식단 사진 분석</span>
        </button>
      </div>

      {/* Hydration & Protein Guard Card */}
      <div className="w-full rounded-2xl bg-[#15223B] border border-[#31446B]/60 p-3.5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#7DD3FC]">
            GLP-1 근손실·탈수 방지 가드
          </h3>
          <p className="text-xs text-white font-mono tabular-nums mt-0.5">
            오늘 단백질 {todayProteinGrams}g / 목표 80g · 수분 {todayWaterMl.toLocaleString()}ml / 목표 2,000ml
          </p>
        </div>
        <button
          type="button"
          onClick={onAddWaterCup}
          data-testid="add_water_cup_button"
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#7DD3FC]/60 hover:bg-[#7DD3FC]/15 text-xs font-semibold text-[#7DD3FC] transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>+250ml</span>
        </button>
      </div>

      {/* Zero-Effort Cards */}
      {items.map((item) => (
        <div
          key={item.id}
          data-testid={`confirm_card_${item.id}`}
          className={`w-full rounded-2xl overflow-hidden border transition-colors ${
            item.isConfirmed
              ? 'bg-[#111C30] border-[#34D399]/50'
              : 'bg-[#182642] border-2 border-[#FCD34D]'
          }`}
        >
          {item.imageUrl && (
            <div className="relative w-full h-[165px] bg-[#0A111F]">
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#090D16]/85 text-[11px] font-medium text-[#7DD3FC]">
                {item.sourceBadge}
              </div>
            </div>
          )}

          <div className="p-3.5 flex flex-col gap-2">
            {!item.imageUrl && (
              <div className="text-[11px] font-medium text-[#7DD3FC]">
                {item.sourceBadge}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-white">
                {item.title}
              </h3>
              <span className="text-xs text-[#A5B4FC] font-mono whitespace-nowrap">
                {item.detectedTime}
              </span>
            </div>

            <div className="w-full rounded-xl bg-[#0E172A] p-2.5 text-sm text-[#E2E8F0] leading-relaxed">
              마일로: "{item.miloQuestion}"
            </div>

            <div className="text-xs font-semibold text-[#FCD34D] font-mono tabular-nums">
              {item.nutritionOrMetricSummary}
            </div>

            {item.isConfirmed ? (
              <div className="mt-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#34D399]/15 text-xs font-semibold text-[#34D399]">
                <BadgeCheck className="w-4 h-4 shrink-0" />
                <span>사용자 확인 완료 · 건강 일기에 반영됨</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onConfirmItem(item.id)}
                data-testid={`confirm_action_btn_${item.id}`}
                className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#34D399] hover:bg-[#10B981] text-[#042F1E] font-bold text-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>"{item.userQuickReplyText}" (원터치 승인)</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

interface Glp1CareTabContentProps {
  currentMedication: string;
  selectedSite: InjectionSiteId;
  selectedSideEffects: string[];
  selectedMood: string;
  logs: Glp1DoseLog[];
  onSelectSite: (site: InjectionSiteId) => void;
  onToggleSideEffect: (effect: string) => void;
  onSelectMood: (mood: string) => void;
  onRecordInjection: () => void;
}

const SIDE_EFFECT_OPTIONS = [
  '경미한 오심(울렁거림)',
  '식욕 억제 양호',
  '주사 당일 피로감',
  '속쓰림/체기',
  '주사 부위 열감 없음',
];

const MOOD_OPTIONS = [
  '😌 평온·다독임',
  '🥺 속 울렁·지침',
  '😊 가뿐·활기참',
  '🍫 스트레스·위로필요',
];

export const Glp1CareTabContent: React.FC<Glp1CareTabContentProps> = ({
  currentMedication,
  selectedSite,
  selectedSideEffects,
  selectedMood,
  logs,
  onSelectSite,
  onToggleSideEffect,
  onSelectMood,
  onRecordInjection,
}) => {
  const currentSiteMeta =
    INJECTION_SITE_LIST.find((s) => s.key === selectedSite) || INJECTION_SITE_LIST[3];

  return (
    <div data-testid="glp1_care_tab_list" className="flex flex-col gap-3.5 p-4">
      <div className="w-full rounded-2xl bg-[#162440] border border-[#31446B]/60 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <HeartPulse className="w-5 h-5 text-[#7DD3FC] shrink-0" />
          <div>
            <h2 className="text-base font-bold text-white">
              GLP-1 투여 부위 로테이션 & 부작용 케어
            </h2>
            <p className="text-xs text-[#7DD3FC]">
              현재 처방: {currentMedication} · 매주 목요일 오전 투여
            </p>
          </div>
        </div>

        <div className="w-full rounded-xl bg-[#0E172A] p-3 text-sm text-[#FCD34D]">
          마일로 가이드: "지난주엔 [복부 좌하단]에 맞았으니까, 피부 뭉침 방지를 위해 오늘은 [복부 우하단 ⭐]에 맞을 차례야!"
        </div>

        {/* 6-Zone Body Rotation Grid */}
        <div className="grid grid-cols-2 gap-2">
          {INJECTION_SITE_LIST.map((site) => {
            const isSelected = site.key === selectedSite;
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => onSelectSite(site.key)}
                data-testid={`injection_site_${site.id}`}
                className={`p-3 rounded-xl text-left border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#7DD3FC]/25 border-2 border-[#7DD3FC]'
                    : site.isRecommendedToday
                      ? 'bg-[#0F182B] border border-[#FCD34D]'
                      : 'bg-[#0F182B] border border-[#2B3B5E] hover:bg-[#15223B]'
                }`}
              >
                <div
                  className={`text-xs font-bold ${
                    isSelected ? 'text-[#7DD3FC]' : 'text-white'
                  }`}
                >
                  {site.labelKo}
                </div>
                <div className="text-[11px] text-[#AEC0DA] font-mono tabular-nums mt-0.5">
                  마지막 투여: {site.lastUsedDaysAgo}일 전
                </div>
              </button>
            );
          })}
        </div>

        {/* Side Effects Multi-Select */}
        <div>
          <div className="text-xs font-semibold text-white mb-2">
            오늘의 주사 후 부작용 문진 (다중 선택)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SIDE_EFFECT_OPTIONS.map((effect) => {
              const selected = selectedSideEffects.includes(effect);
              return (
                <button
                  key={effect}
                  type="button"
                  onClick={() => onToggleSideEffect(effect)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors whitespace-nowrap cursor-pointer ${
                    selected
                      ? 'bg-[#FB7185]/22 border-[#FB7185] text-[#FB7185] font-semibold'
                      : 'bg-[#0F182B] border-[#2B3B5E] text-[#AEC0DA] hover:text-white'
                  }`}
                >
                  {effect}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood Selector */}
        <div>
          <div className="text-xs font-semibold text-white mb-2">
            오늘의 감정 & 멘탈 컨디션
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MOOD_OPTIONS.map((mood) => {
              const selected = mood === selectedMood;
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => onSelectMood(mood)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors whitespace-nowrap cursor-pointer ${
                    selected
                      ? 'bg-[#A5B4FC]/25 border-[#A5B4FC] text-[#A5B4FC] font-semibold'
                      : 'bg-[#0F182B] border-[#2B3B5E] text-[#AEC0DA] hover:text-white'
                  }`}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onRecordInjection}
          data-testid="record_glp1_injection_button"
          className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#7DD3FC] hover:bg-[#38BDF8] text-[#042F49] font-bold text-xs transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>[{currentSiteMeta.shortLabel} · 5.0mg] 투여 및 컨디션 기록 완료</span>
        </button>
      </div>

      {/* Historical Logs */}
      {logs.map((log) => (
        <div
          key={log.id}
          className="w-full rounded-2xl bg-[#121C31] border border-[#31446B]/50 p-3.5 flex flex-col gap-1"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">
              {log.dateLabel} · {log.medicationName}
            </h3>
            <span className="text-xs font-semibold text-[#FCD34D]">
              {log.moodEmoji}
            </span>
          </div>
          <div className="text-xs text-[#7DD3FC]">
            투여 부위: {log.site.labelKo} · 부작용: {log.sideEffects.join(', ')}
          </div>
          <p className="text-xs text-[#AEC0DA] mt-1 leading-relaxed">
            {log.miloCareNote}
          </p>
        </div>
      ))}
    </div>
  );
};

interface MiloMotionsGalleryTabContentProps {
  activePose: MiloPoseState;
  onSelectPose: (pose: MiloPoseState) => void;
}

export const MiloMotionsGalleryTabContent: React.FC<
  MiloMotionsGalleryTabContentProps
> = ({ activePose, onSelectPose }) => {
  const categories = Array.from(
    new Set(MILO_POSE_LIST.map((p) => p.sheetCategory))
  );

  return (
    <div
      data-testid="milo_motions_gallery_list"
      className="flex flex-col gap-4 p-4"
    >
      <div>
        <h2 className="text-lg font-bold text-white">
          마일로 캐릭터 시트 14종 상태 머신
        </h2>
        <p className="text-xs text-[#AEC0DA] mt-0.5">
          캐릭터 리소스(Events 6종 · Exercise 1 4종 · Exercise 2 4종)를 선택하면 좌측 마일로 스테이지가 즉시 반응합니다.
        </p>
      </div>

      {categories.map((category) => {
        const poses = MILO_POSE_LIST.filter((p) => p.sheetCategory === category);
        return (
          <div key={category} className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[#7DD3FC]">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {poses.map((pose) => {
                const selected = pose.id === activePose;
                return (
                  <button
                    key={pose.id}
                    type="button"
                    onClick={() => onSelectPose(pose.id)}
                    data-testid={`motion_card_${pose.id.toLowerCase()}`}
                    style={{
                      borderColor: selected ? pose.badgeColorHex : '#2B3B5E',
                    }}
                    className={`p-3 rounded-2xl text-left border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#1B2B4B] border-2'
                        : 'bg-[#121D33] hover:bg-[#172540]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: pose.badgeColorHex }}
                      >
                        {pose.titleKo}
                      </span>
                      {selected && (
                        <span className="text-[11px] font-semibold text-[#34D399]">
                          재생 중
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#AEC0DA] font-mono">
                      {pose.titleEn}
                    </div>
                    <p className="text-xs text-[#CBD5E1] mt-1.5 line-clamp-2 leading-relaxed">
                      {pose.miloBubbleQuote}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DoctorMedicalReportTabContentProps {
  weightTrend: DailyWeightPoint[];
  clinicalSummary: string;
  exportedPdfStatus: string | null;
  leftPaneWeight: number;
  onAdjustSplitWeight: (weight: number) => void;
  onExportPdf: () => void;
}

export const DoctorMedicalReportTabContent: React.FC<
  DoctorMedicalReportTabContentProps
> = ({
  weightTrend,
  clinicalSummary,
  exportedPdfStatus,
  leftPaneWeight,
  onAdjustSplitWeight,
  onExportPdf,
}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padX = 28;
    const padY = 20;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;

    if (weightTrend.length >= 2) {
      const stepX = innerW / (weightTrend.length - 1);

      ctx.beginPath();
      weightTrend.forEach((pt, idx) => {
        const x = padX + idx * stepX;
        const normalizedY = Math.min(Math.max((79.0 - pt.weightKg) / 6.0, 0), 1);
        const y = padY + innerH * (1 - normalizedY);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#7DD3FC';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      weightTrend.forEach((pt, idx) => {
        const x = padX + idx * stepX;
        const normalizedY = Math.min(Math.max((79.0 - pt.weightKg) / 6.0, 0), 1);
        const y = padY + innerH * (1 - normalizedY);
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#7DD3FC';
        ctx.fill();
      });
    }
  }, [weightTrend]);

  const leftPct = Math.round(leftPaneWeight * 100);

  return (
    <div
      data-testid="doctor_report_tab_list"
      className="flex flex-col gap-3.5 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            병원 제출용 Medical Bridge 리포트
          </h2>
          <p className="text-xs text-[#AEC0DA]">
            진료 시 의사 선생님께 폴드 7 대화면으로 바로 보여주거나 PDF로 내보냅니다
          </p>
        </div>
        <button
          type="button"
          onClick={onExportPdf}
          data-testid="export_doctor_pdf_button"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#34D399] hover:bg-[#10B981] text-[#042F1E] font-bold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>PDF 리포트 생성</span>
        </button>
      </div>

      {exportedPdfStatus && (
        <div
          data-testid="pdf_export_status_banner"
          className="w-full rounded-xl bg-[#34D399]/15 border border-[#34D399] p-3 text-xs font-semibold text-[#34D399]"
        >
          {exportedPdfStatus}
        </div>
      )}

      {/* 4-Week Weight & Skeletal Muscle Preservation Chart Card */}
      <div className="w-full rounded-2xl bg-[#15223B] border border-[#31446B]/60 p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            최근 4주 체중 감량(-4.1kg) 및 골격근량 방어 추이
          </h3>
          <p className="text-xs text-[#7DD3FC] mt-0.5">
            파란선: 체중(78.3kg → 74.2kg) · 골격근량(28.4kg → 28.2kg 유지)
          </p>
        </div>

        <div className="w-full h-[130px] rounded-xl bg-[#0B1324] overflow-hidden">
          <canvas
            ref={chartCanvasRef}
            width={520}
            height={130}
            className="w-full h-full"
          />
        </div>

        <div className="grid grid-cols-4 gap-2 text-center font-mono tabular-nums">
          {weightTrend.map((pt) => (
            <div
              key={pt.weekLabel}
              className="rounded-xl bg-[#0E172A] p-2.5 flex flex-col items-center"
            >
              <span className="text-sm font-bold text-white">
                {pt.weightKg.toFixed(1)}kg
              </span>
              <span className="text-[11px] font-semibold text-[#34D399]">
                근육 {pt.skeletalMuscleKg.toFixed(1)}kg
              </span>
              <span className="text-[10px] text-[#AEC0DA] mt-0.5">
                {pt.weekLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Summary Card */}
      <div className="w-full rounded-2xl bg-[#15223B] border border-[#31446B]/60 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-[#FCD34D]" />
          <h3 className="text-sm font-bold text-white">
            담당 의사 선생님 제출용 AI 임상 요약 (30일 상관관계)
          </h3>
        </div>
        <div className="text-sm text-[#E2E8F0] whitespace-pre-line leading-relaxed bg-[#0E172A] p-3.5 rounded-xl">
          {clinicalSummary}
        </div>
      </div>

      {/* Galaxy Z Fold 7 Split Ratio Controller */}
      <div className="w-full rounded-2xl bg-[#111B30] border border-[#31446B]/60 p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#7DD3FC]" />
            <span className="text-sm font-bold text-white">
              Galaxy Z Fold 7 좌/우 패널 폭 비율 조절
            </span>
          </div>
          <span className="text-xs font-mono tabular-nums font-bold text-[#7DD3FC]">
            마일로 {leftPct}% : 허브 {100 - leftPct}%
          </span>
        </div>
        <input
          type="range"
          min={0.36}
          max={0.62}
          step={0.01}
          value={leftPaneWeight}
          onChange={(e) => onAdjustSplitWeight(parseFloat(e.target.value))}
          data-testid="fold_split_ratio_slider"
          className="w-full accent-[#7DD3FC] cursor-pointer"
        />
      </div>
    </div>
  );
};
