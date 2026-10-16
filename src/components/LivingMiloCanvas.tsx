import React, { useEffect, useRef, useState } from 'react';
import { AudioWaveform, Mic, Hand } from 'lucide-react';
import {
  MiloPoseState,
  MILO_POSES,
  MiloTurnaroundView,
  TURNAROUND_VIEWS,
} from '../types/models';

interface LivingMiloStageCardProps {
  poseState: MiloPoseState;
  turnaroundView: MiloTurnaroundView;
  isVoiceActive: boolean;
  voiceDecibel: number;
  petCount: number;
  onPetMilo: () => void;
  onSelectTurnaround: (view: MiloTurnaroundView) => void;
  onToggleVoiceMode: () => void;
}

export const LivingMiloStageCard: React.FC<LivingMiloStageCardProps> = ({
  poseState,
  turnaroundView,
  isVoiceActive,
  voiceDecibel,
  petCount,
  onPetMilo,
  onSelectTurnaround,
  onToggleVoiceMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const squishRef = useRef<number>(0);
  const [isSquishedUi, setIsSquishedUi] = useState(false);

  const poseMeta = MILO_POSES[poseState];

  const handleCanvasClick = () => {
    squishRef.current = 1.0;
    setIsSquishedUi(true);
    onPetMilo();
    window.setTimeout(() => {
      setIsSquishedUi(false);
    }, 280);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;

    const render = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.54;
      const baseRadius = Math.min(width, height) * 0.31;

      const breathPeriod = isVoiceActive ? 650 : 1900;
      const breathPhase = (Math.sin((time / breathPeriod) * Math.PI * 2) + 1) / 2;
      const tuftPeriod = isVoiceActive ? 380 : 1400;
      const tuftAngleDeg =
        -8 + ((Math.sin((time / tuftPeriod) * Math.PI * 2) + 1) / 2) * 20;

      squishRef.current *= 0.88;
      const sq = squishRef.current;

      // Voice Reactive Aura Rings
      if (isVoiceActive) {
        const waveRadius1 =
          baseRadius * (1.35 + breathPhase * 0.25 + voiceDecibel * 0.2);
        const waveRadius2 = baseRadius * (1.18 + breathPhase * 0.15);

        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(125, 211, 252, 0.14)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(142, 197, 252, 0.24)';
        ctx.fill();
      }

      // Soft floor shadow
      ctx.beginPath();
      ctx.ellipse(
        centerX,
        centerY + baseRadius * 1.02,
        baseRadius * 0.85,
        baseRadius * 0.14,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // Pose-specific background props (Yoga mat, Step box, Tricycle)
      drawPoseBackgroundProps(ctx, poseState, centerX, centerY, baseRadius);

      const squatOffsetY =
        poseState === MiloPoseState.SQUAT_HOLD
          ? baseRadius * 0.16
          : poseState === MiloPoseState.STEADY_JOGGING ||
              poseState === MiloPoseState.HAPPY_CHEERING
            ? -breathPhase * 14
            : -breathPhase * 6;

      const scaleX = 1 + breathPhase * 0.03 + sq * 0.14;
      const baseScaleY = 1 - breathPhase * 0.025 - sq * 0.14;
      const scaleY =
        poseState === MiloPoseState.SQUAT_HOLD ? baseScaleY * 0.88 : baseScaleY;

      const pivotY = centerY + baseRadius * 0.6;
      ctx.save();
      ctx.translate(centerX, pivotY);
      ctx.scale(scaleX, scaleY);
      ctx.translate(-centerX, -pivotY);

      drawPlushMiloCharacter(
        ctx,
        poseState,
        turnaroundView,
        centerX,
        centerY + squatOffsetY,
        baseRadius,
        tuftAngleDeg,
        sq > 0.25 || isSquishedUi,
        isVoiceActive,
        breathPhase
      );

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [poseState, turnaroundView, isVoiceActive, voiceDecibel, isSquishedUi]);

  return (
    <div
      className="w-full rounded-3xl bg-[#10192D] p-3.5 border-[1.5px] transition-colors"
      style={{ borderColor: `${poseMeta.badgeColorHex}8C` }}
    >
      {/* Top Status Row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/images/img_milo_plush.jpg"
            alt="마일로 플러시 원본 텍스처"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border-[1.5px] border-[#7DD3FC] shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-extrabold text-white whitespace-nowrap">
                살아 숨 쉬는 마일로 (Milo)
              </h2>
              <span
                className="text-xs font-semibold whitespace-nowrap"
                style={{ color: poseMeta.badgeColorHex }}
              >
                · {poseMeta.titleKo}
              </span>
            </div>
            <p className="text-xs text-[#AEC0DA] font-mono tabular-nums truncate">
              {poseMeta.sheetCategory} · 쓰다듬기 {petCount}회
            </p>
          </div>
        </div>

        {/* Voice Live Mode Toggle */}
        <button
          type="button"
          onClick={onToggleVoiceMode}
          data-testid="toggle_milo_voice_chip"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isVoiceActive
              ? 'bg-[#FB7185]/25 border-[#FB7185] text-[#FB7185]'
              : 'bg-[#131D31] border-[#31446B] text-[#7DD3FC] hover:bg-[#1D2A44]'
          }`}
        >
          {isVoiceActive ? (
            <AudioWaveform className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
          <span>{isVoiceActive ? 'Live 음성 중' : '음성 교감'}</span>
        </button>
      </div>

      {/* Interactive 2.5D/3D Procedural Plush Milo Stage */}
      <div
        className="relative w-full h-[235px] rounded-2xl overflow-hidden flex items-center justify-center select-none"
        style={{
          background: 'radial-gradient(circle at center, #1E325C 0%, #0E172A 100%)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={460}
          height={235}
          onClick={handleCanvasClick}
          data-testid="living_milo_interactive_canvas"
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Top-left Turnaround Switcher */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
          {TURNAROUND_VIEWS.map((view) => {
            const active = view.id === turnaroundView;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => onSelectTurnaround(view.id)}
                data-testid={`turnaround_${view.id.toLowerCase()}`}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#7DD3FC]/30 border border-[#7DD3FC] text-[#7DD3FC] font-semibold'
                    : 'bg-[#090D16]/70 border border-transparent text-white hover:bg-[#090D16]/90'
                }`}
              >
                {view.labelKo}
              </button>
            );
          })}
        </div>

        {/* Bottom-right Touch Hint */}
        <button
          type="button"
          onClick={handleCanvasClick}
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#090D16]/75 text-[11px] text-[#FCD34D] hover:bg-[#090D16] transition-colors cursor-pointer"
        >
          <Hand className="w-3.5 h-3.5" />
          <span>배·볼을 콕 찔러보세요!</span>
        </button>
      </div>

      {/* Milo Speech Bubble */}
      <div
        data-testid="milo_speech_bubble"
        className="mt-2.5 w-full rounded-2xl bg-[#17253F] border border-[#7DD3FC]/35 p-3 text-sm text-[#E2E8F0] leading-relaxed"
      >
        마일로: "{poseMeta.miloBubbleQuote}"
      </div>
    </div>
  );
};

function drawRoundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawPoseBackgroundProps(
  ctx: CanvasRenderingContext2D,
  poseState: MiloPoseState,
  centerX: number,
  centerY: number,
  baseRadius: number
) {
  if (poseState === MiloPoseState.YOGA_STRETCHING) {
    const matWidth = baseRadius * 2.5;
    const matHeight = baseRadius * 0.34;
    const matTop = centerY + baseRadius * 0.72;
    const stripeColors = ['#6EE7B7', '#FCD34D', '#FCA5A5', '#93C5FD', '#C4B5FD'];
    const stripeWidth = matWidth / stripeColors.length;
    stripeColors.forEach((color, idx) => {
      drawRoundRectPath(
        ctx,
        centerX - matWidth / 2 + idx * stripeWidth,
        matTop,
        stripeWidth + 2,
        matHeight,
        6
      );
      ctx.fillStyle = color;
      ctx.fill();
    });
  } else if (poseState === MiloPoseState.STAIR_CLIMBING) {
    const stepTop = centerY + baseRadius * 0.65;
    drawRoundRectPath(
      ctx,
      centerX - baseRadius * 1.1,
      stepTop,
      baseRadius * 1.2,
      baseRadius * 0.38,
      8
    );
    ctx.fillStyle = '#FB7185';
    ctx.fill();

    drawRoundRectPath(
      ctx,
      centerX - baseRadius * 0.5,
      stepTop - baseRadius * 0.14,
      baseRadius * 1.1,
      baseRadius * 0.25,
      6
    );
    ctx.fillStyle = '#FBBF24';
    ctx.fill();

    drawRoundRectPath(
      ctx,
      centerX - baseRadius * 0.1,
      stepTop - baseRadius * 0.28,
      baseRadius * 1.0,
      baseRadius * 0.22,
      6
    );
    ctx.fillStyle = '#60A5FA';
    ctx.fill();
  } else if (poseState === MiloPoseState.CYCLING) {
    const wheelY = centerY + baseRadius * 0.75;
    ctx.beginPath();
    ctx.arc(centerX - baseRadius * 0.55, wheelY, baseRadius * 0.28, 0, Math.PI * 2);
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX + baseRadius * 0.55, wheelY, baseRadius * 0.24, 0, Math.PI * 2);
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 7;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - baseRadius * 0.55, wheelY);
    ctx.lineTo(centerX, centerY + baseRadius * 0.35);
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function drawPlushMiloCharacter(
  ctx: CanvasRenderingContext2D,
  poseState: MiloPoseState,
  turnaroundView: MiloTurnaroundView,
  centerX: number,
  centerY: number,
  r: number,
  tuftAngleDeg: number,
  isSquished: boolean,
  isVoiceActive: boolean,
  breathPhase: number
) {
  const plushGrad = ctx.createRadialGradient(
    centerX - r * 0.2,
    centerY - r * 0.25,
    r * 0.1,
    centerX,
    centerY,
    r * 1.35
  );
  plushGrad.addColorStop(0, '#8EC5FC');
  plushGrad.addColorStop(0.55, '#6DAEF4');
  plushGrad.addColorStop(1, '#3E84D9');

  // Side or Back cute tail
  if (
    turnaroundView === MiloTurnaroundView.SIDE ||
    turnaroundView === MiloTurnaroundView.BACK
  ) {
    const tailOffsetX = turnaroundView === MiloTurnaroundView.SIDE ? r * 0.75 : 0;
    ctx.beginPath();
    ctx.ellipse(
      centerX + tailOffsetX,
      centerY + r * 0.4,
      r * 0.24,
      r * 0.18,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#6DAEF4';
    ctx.fill();
  }

  // Stubby Plush Feet
  const leftFootOffsetY =
    poseState === MiloPoseState.WALKING_CHEERFULLY ||
    poseState === MiloPoseState.STEADY_JOGGING ||
    poseState === MiloPoseState.STAIR_CLIMBING
      ? -Math.sin(breathPhase * Math.PI) * r * 0.14
      : 0;

  ctx.beginPath();
  ctx.ellipse(
    centerX - r * 0.36,
    centerY + r * 0.8 + leftFootOffsetY,
    r * 0.22,
    r * 0.125,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = '#3E84D9';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    centerX + r * 0.36,
    centerY + r * 0.8 - leftFootOffsetY,
    r * 0.22,
    r * 0.125,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = '#3E84D9';
  ctx.fill();

  // Lower Pear-Shaped Chubby Torso
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY + r * 0.3,
    r * 0.88,
    r * 0.525,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = plushGrad;
  ctx.fill();

  // Upper Chubby Head/Cheeks Silhouette
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY - r * 0.32,
    r * 0.74,
    r * 0.46,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = plushGrad;
  ctx.fill();

  // Signature Curved Water-Drop Head Tuft
  ctx.save();
  ctx.translate(centerX, centerY - r * 0.75);
  ctx.rotate((tuftAngleDeg * Math.PI) / 180);
  ctx.translate(-centerX, -(centerY - r * 0.75));
  ctx.beginPath();
  ctx.moveTo(centerX - r * 0.12, centerY - r * 0.72);
  ctx.bezierCurveTo(
    centerX - r * 0.22,
    centerY - r * 1.12,
    centerX + r * 0.28,
    centerY - r * 1.15,
    centerX + r * 0.16,
    centerY - r * 0.86
  );
  ctx.closePath();
  ctx.fillStyle = '#8EC5FC';
  ctx.fill();
  ctx.restore();

  // Soft White Glowing Belly
  if (turnaroundView !== MiloTurnaroundView.BACK) {
    const bellyShiftX = turnaroundView === MiloTurnaroundView.SIDE ? -r * 0.25 : 0;
    const bellyGrad = ctx.createRadialGradient(
      centerX + bellyShiftX,
      centerY + r * 0.25,
      r * 0.05,
      centerX + bellyShiftX,
      centerY + r * 0.25,
      r * 0.58
    );
    bellyGrad.addColorStop(0, '#FFFFFF');
    bellyGrad.addColorStop(0.6, '#EAF4FF');
    bellyGrad.addColorStop(1, 'rgba(142, 197, 252, 0.2)');

    ctx.beginPath();
    ctx.ellipse(
      centerX + bellyShiftX,
      centerY + r * 0.32,
      r * 0.56,
      r * 0.38,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = bellyGrad;
    ctx.fill();
  }

  // Left & Right Chubby Arms
  const leftArmAngle =
    poseState === MiloPoseState.HAPPY_CHEERING ||
    poseState === MiloPoseState.YOGA_STRETCHING
      ? -45
      : poseState === MiloPoseState.STRENGTH_TRAINING
        ? -55
        : 20;
  const rightArmAngle =
    poseState === MiloPoseState.HAPPY_CHEERING ||
    poseState === MiloPoseState.YOGA_STRETCHING
      ? 45
      : poseState === MiloPoseState.GLP1_ACTION
        ? 35
        : -25;

  ctx.save();
  ctx.translate(centerX - r * 0.7, centerY - r * 0.05);
  ctx.rotate((leftArmAngle * Math.PI) / 180);
  ctx.beginPath();
  ctx.ellipse(-r * 0.14, 0, r * 0.24, r * 0.17, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#8EC5FC';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(centerX + r * 0.7, centerY - r * 0.05);
  ctx.rotate((rightArmAngle * Math.PI) / 180);
  ctx.beginPath();
  ctx.ellipse(r * 0.14, 0, r * 0.24, r * 0.17, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#8EC5FC';
  ctx.fill();
  ctx.restore();

  // Facial Features
  if (turnaroundView !== MiloTurnaroundView.BACK) {
    const faceOffsetX = turnaroundView === MiloTurnaroundView.SIDE ? -r * 0.28 : 0;
    const cheekAlpha =
      isSquished || isVoiceActive || poseState === MiloPoseState.STEADY_JOGGING
        ? 0.85
        : 0.6;

    // Left cheek
    const leftCheekX = centerX - r * 0.38 + faceOffsetX;
    const cheekY = centerY - r * 0.24;
    const leftCheekGrad = ctx.createRadialGradient(
      leftCheekX,
      cheekY,
      2,
      leftCheekX,
      cheekY,
      r * 0.22
    );
    leftCheekGrad.addColorStop(0, `rgba(249, 178, 162, ${cheekAlpha})`);
    leftCheekGrad.addColorStop(1, 'rgba(249, 178, 162, 0)');
    ctx.beginPath();
    ctx.arc(leftCheekX, cheekY, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = leftCheekGrad;
    ctx.fill();

    if (turnaroundView === MiloTurnaroundView.FRONT) {
      const rightCheekX = centerX + r * 0.38;
      const rightCheekGrad = ctx.createRadialGradient(
        rightCheekX,
        cheekY,
        2,
        rightCheekX,
        cheekY,
        r * 0.22
      );
      rightCheekGrad.addColorStop(0, `rgba(249, 178, 162, ${cheekAlpha})`);
      rightCheekGrad.addColorStop(1, 'rgba(249, 178, 162, 0)');
      ctx.beginPath();
      ctx.arc(rightCheekX, cheekY, r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = rightCheekGrad;
      ctx.fill();
    }

    const eyeY = centerY - r * 0.34;
    const leftEyeX = centerX - r * 0.22 + faceOffsetX;
    const rightEyeX = centerX + r * 0.22 + faceOffsetX;

    if (
      poseState === MiloPoseState.HAPPY_CHEERING ||
      poseState === MiloPoseState.YOGA_STRETCHING ||
      isSquished
    ) {
      ctx.beginPath();
      ctx.arc(leftEyeX, eyeY + r * 0.02, r * 0.075, Math.PI * 1.1, Math.PI * 1.9);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      if (turnaroundView === MiloTurnaroundView.FRONT) {
        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY + r * 0.02, r * 0.075, Math.PI * 1.1, Math.PI * 1.9);
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.ellipse(leftEyeX, eyeY, r * 0.065, r * 0.09, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#162033';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(leftEyeX - r * 0.02, eyeY - r * 0.04, r * 0.028, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      if (turnaroundView === MiloTurnaroundView.FRONT) {
        ctx.beginPath();
        ctx.ellipse(rightEyeX, eyeY, r * 0.065, r * 0.09, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#162033';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(rightEyeX - r * 0.02, eyeY - r * 0.04, r * 0.028, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    }

    // Eyebrows
    if (poseState === MiloPoseState.SAD_WORRIED) {
      ctx.beginPath();
      ctx.moveTo(leftEyeX - r * 0.08, eyeY - r * 0.14);
      ctx.lineTo(leftEyeX + r * 0.06, eyeY - r * 0.19);
      ctx.moveTo(rightEyeX - r * 0.06, eyeY - r * 0.19);
      ctx.lineTo(rightEyeX + r * 0.08, eyeY - r * 0.14);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    } else if (
      poseState === MiloPoseState.STRENGTH_TRAINING ||
      poseState === MiloPoseState.SQUAT_HOLD
    ) {
      ctx.beginPath();
      ctx.moveTo(leftEyeX - r * 0.08, eyeY - r * 0.18);
      ctx.lineTo(leftEyeX + r * 0.06, eyeY - r * 0.13);
      ctx.moveTo(rightEyeX - r * 0.06, eyeY - r * 0.13);
      ctx.lineTo(rightEyeX + r * 0.08, eyeY - r * 0.18);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Mouth
    const mouthY = centerY - r * 0.22;
    if (poseState === MiloPoseState.SAD_WORRIED) {
      ctx.beginPath();
      ctx.arc(
        centerX + faceOffsetX,
        mouthY + r * 0.06,
        r * 0.08,
        Math.PI * 1.15,
        Math.PI * 1.85
      );
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    } else if (
      isVoiceActive ||
      poseState === MiloPoseState.HAPPY_CHEERING ||
      poseState === MiloPoseState.GLP1_ACTION
    ) {
      ctx.beginPath();
      ctx.ellipse(
        centerX + faceOffsetX,
        mouthY + r * 0.03,
        r * 0.09,
        r * 0.065 + breathPhase * 3,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#E15B64';
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(
        centerX + faceOffsetX,
        mouthY - r * 0.01,
        r * 0.085,
        Math.PI * 0.15,
        Math.PI * 0.85
      );
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // Foreground Props for Specific Poses
  if (poseState === MiloPoseState.GLP1_ACTION) {
    // Band-Aid on lower abdomen
    drawRoundRectPath(
      ctx,
      centerX + r * 0.14,
      centerY + r * 0.25,
      r * 0.28,
      r * 0.14,
      5
    );
    ctx.fillStyle = '#FDE68A';
    ctx.fill();

    // GLP-1 Pen Injector
    drawRoundRectPath(
      ctx,
      centerX + r * 0.78,
      centerY - r * 0.35,
      r * 0.2,
      r * 0.56,
      6
    );
    ctx.fillStyle = '#A78BFA';
    ctx.fill();

    drawRoundRectPath(
      ctx,
      centerX + r * 0.8,
      centerY - r * 0.15,
      r * 0.16,
      r * 0.18,
      3
    );
    ctx.fillStyle = '#34D399';
    ctx.fill();
  } else if (poseState === MiloPoseState.MEAL_CHECK) {
    // Magnifying Glass
    ctx.beginPath();
    ctx.arc(centerX - r * 0.32, centerY + r * 0.02, r * 0.18, 0, Math.PI * 2);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - r * 0.44, centerY + r * 0.14);
    ctx.lineTo(centerX - r * 0.56, centerY + r * 0.28);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Poke Bowl in right hand
    ctx.beginPath();
    ctx.arc(centerX + r * 0.68, centerY + r * 0.06, r * 0.24, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = '#FBBF24';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX + r * 0.6, centerY + r * 0.02, r * 0.075, 0, Math.PI * 2);
    ctx.fillStyle = '#FB7185';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX + r * 0.76, centerY + r * 0.03, r * 0.075, 0, Math.PI * 2);
    ctx.fillStyle = '#34D399';
    ctx.fill();
  } else if (poseState === MiloPoseState.SUCCESS_SCALE) {
    const scaleLeft = centerX + r * 0.65;
    const scaleTop = centerY + r * 0.25;
    drawRoundRectPath(ctx, scaleLeft, scaleTop, r * 0.56, r * 0.56, 10);
    ctx.fillStyle = '#BAE6FD';
    ctx.fill();

    drawRoundRectPath(
      ctx,
      scaleLeft + r * 0.08,
      scaleTop + r * 0.08,
      r * 0.4,
      r * 0.16,
      4
    );
    ctx.fillStyle = '#38BDF8';
    ctx.fill();
  } else if (poseState === MiloPoseState.STRENGTH_TRAINING) {
    const dbCenterX = centerX - r * 0.92;
    const dbCenterY = centerY - r * 0.25;
    ctx.beginPath();
    ctx.moveTo(dbCenterX - r * 0.18, dbCenterY);
    ctx.lineTo(dbCenterX + r * 0.18, dbCenterY);
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(dbCenterX - r * 0.2, dbCenterY, r * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#FB7185';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(dbCenterX + r * 0.2, dbCenterY, r * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#34D399';
    ctx.fill();
  }
}
