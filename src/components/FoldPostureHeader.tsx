import React from 'react';
import {
  Camera,
  FileText,
  PlayCircle,
  Utensils,
  ArrowLeftRight,
  Columns2,
} from 'lucide-react';
import {
  FoldPostureMode,
  FOLD_POSTURE_MODES,
} from '../types/models';

interface FoldPostureHeaderProps {
  postureMode: FoldPostureMode;
  showHingeGuide: boolean;
  todaySteps: number;
  todayProteinGrams: number;
  todayWaterMl: number;
  onSelectPosture: (mode: FoldPostureMode) => void;
  onToggleHingeGuide: () => void;
  onSwapPanes: () => void;
  onPickFoodPhoto: () => void;
  onRunDemo1Glp1: () => void;
  onRunDemo2Meal: () => void;
  onRunDemo3Report: () => void;
}

export const FoldPostureHeader: React.FC<FoldPostureHeaderProps> = ({
  postureMode,
  showHingeGuide,
  todaySteps,
  todayProteinGrams,
  todayWaterMl,
  onSelectPosture,
  onToggleHingeGuide,
  onSwapPanes,
  onPickFoodPhoto,
  onRunDemo1Glp1,
  onRunDemo2Meal,
  onRunDemo3Report,
}) => {
  const currentPosture = FOLD_POSTURE_MODES[postureMode];

  return (
    <header className="w-full bg-gradient-to-r from-[#0E1729] via-[#15233E] to-[#0E1729] border-b border-[#31446B]/50 px-4 py-2.5 shrink-0 z-20">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-2">
        {/* Top Row: Milo Brand Identity + Real-time Health Connect Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/images/img_milo_plush.jpg"
              alt="마일로 앱 아이콘"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border-[1.5px] border-[#7DD3FC] shrink-0 bg-[#131D31]"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight whitespace-nowrap">
                  Milo (마일로)
                </h1>
                <span className="text-xs font-mono text-[#7DD3FC] whitespace-nowrap">
                  · Z Fold 7 · {currentPosture.ratioLabel}
                </span>
              </div>
              <p className="text-xs text-[#AEC0DA] truncate">
                가장 게으른 방식으로 쓰는 가장 완벽한 GLP-1 & 멘탈 건강 일기
              </p>
            </div>
          </div>

          {/* Live Telemetry Summary */}
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums shrink-0">
            <span className="text-[#34D399] font-semibold whitespace-nowrap">
              걸음 수 {todaySteps.toLocaleString()}보
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-[#FCD34D] font-semibold whitespace-nowrap">
              단백질 {todayProteinGrams}g
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-[#7DD3FC] font-semibold whitespace-nowrap">
              수분 {todayWaterMl.toLocaleString()}ml
            </span>
          </div>
        </div>

        {/* Second Row: 3-Minute Judges Live Demo Triggers + Galaxy Z Fold 7 Posture Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={onRunDemo1Glp1}
            data-testid="demo_scenario_1_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FB7185]/15 hover:bg-[#FB7185]/25 border border-[#FB7185]/40 text-xs font-semibold text-rose-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#FB7185]" />
            <span>데모1: 주사·오심 공감</span>
          </button>

          <button
            type="button"
            onClick={onRunDemo2Meal}
            data-testid="demo_scenario_2_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FCD34D]/15 hover:bg-[#FCD34D]/25 border border-[#FCD34D]/40 text-xs font-semibold text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5 text-[#FCD34D]" />
            <span>데모2: 연어포케 자동감지</span>
          </button>

          <button
            type="button"
            onClick={onRunDemo3Report}
            data-testid="demo_scenario_3_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#34D399]/15 hover:bg-[#34D399]/25 border border-[#34D399]/40 text-xs font-semibold text-emerald-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#34D399]" />
            <span>데모3: 병원용 PDF 자율생성</span>
          </button>

          <button
            type="button"
            onClick={onPickFoodPhoto}
            data-testid="pick_food_photo_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A5B4FC]/15 hover:bg-[#A5B4FC]/25 border border-[#A5B4FC]/40 text-xs font-semibold text-indigo-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[#A5B4FC]" />
            <span>식단 사진 추가</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-700/70 mx-1 shrink-0" />

          {/* Fold 7 Posture Switcher Controls */}
          <div className="flex items-center gap-1 bg-[#0B111E]/80 p-1 rounded-lg border border-[#31446B]/50 shrink-0">
            {Object.values(FOLD_POSTURE_MODES).map((item) => {
              const selected = item.mode === postureMode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => onSelectPosture(item.mode)}
                  data-testid={`posture_chip_${item.mode.toLowerCase()}`}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selected
                      ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/50 font-semibold'
                      : 'text-[#AEC0DA] hover:text-white'
                  }`}
                >
                  {item.titleKo}
                </button>
              );
            })}
          </div>

          {postureMode === FoldPostureMode.UNFOLDED_DUAL && (
            <>
              <button
                type="button"
                onClick={onSwapPanes}
                data-testid="swap_panes_button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#131D31] hover:bg-[#1D2A44] border border-[#31446B] text-xs font-medium text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#7DD3FC]" />
                <span>좌우 스왑</span>
              </button>

              <button
                type="button"
                onClick={onToggleHingeGuide}
                data-testid="toggle_hinge_guide_button"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showHingeGuide
                    ? 'bg-[#7DD3FC]/20 border-[#7DD3FC]/60 text-[#7DD3FC]'
                    : 'bg-[#131D31] border-[#31446B] text-[#AEC0DA] hover:text-white'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>힌지 가이드</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
