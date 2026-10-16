import React, { useState } from 'react';
import { Mic, Send, Sparkles, Loader2 } from 'lucide-react';
import {
  MiloChatMessage,
  MiloPoseState,
  MILO_POSE_LIST,
  MiloTurnaroundView,
} from '../types/models';
import { LivingMiloStageCard } from './LivingMiloCanvas';

interface MiloCompanionLeftPaneProps {
  activePose: MiloPoseState;
  turnaroundView: MiloTurnaroundView;
  isVoiceActive: boolean;
  voiceDecibel: number;
  petCount: number;
  isAiThinking: boolean;
  chatMessages: MiloChatMessage[];
  onPetMilo: () => void;
  onSelectPose: (pose: MiloPoseState) => void;
  onSelectTurnaround: (view: MiloTurnaroundView) => void;
  onToggleVoiceMode: () => void;
  onSendMessage: (text: string) => void;
}

export const MiloCompanionLeftPane: React.FC<MiloCompanionLeftPaneProps> = ({
  activePose,
  turnaroundView,
  isVoiceActive,
  voiceDecibel,
  petCount,
  isAiThinking,
  chatMessages,
  onPetMilo,
  onSelectPose,
  onSelectTurnaround,
  onToggleVoiceMode,
  onSendMessage,
}) => {
  const [messageInput, setMessageInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendMessage(messageInput);
    setMessageInput('');
  };

  return (
    <div
      data-testid="milo_companion_left_pane"
      className="flex flex-col gap-3 p-3.5 h-full overflow-y-auto bg-[#0B111E]"
    >
      {/* 1. Living Milo Interactive Stage */}
      <LivingMiloStageCard
        poseState={activePose}
        turnaroundView={turnaroundView}
        isVoiceActive={isVoiceActive}
        voiceDecibel={voiceDecibel}
        petCount={petCount}
        onPetMilo={onPetMilo}
        onSelectTurnaround={onSelectTurnaround}
        onToggleVoiceMode={onToggleVoiceMode}
      />

      {/* 2. Quick Pose Switcher Row (14 Poses) */}
      <div className="flex flex-col gap-1.5">
        <div className="text-xs font-semibold text-[#7DD3FC]">
          마일로 실시간 감정·운동 모션 전환 (14종)
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {MILO_POSE_LIST.map((pose) => {
            const selected = pose.id === activePose;
            return (
              <button
                key={pose.id}
                type="button"
                onClick={() => onSelectPose(pose.id)}
                data-testid={`quick_pose_chip_${pose.id.toLowerCase()}`}
                style={{
                  borderColor: selected ? pose.badgeColorHex : '#2B3B5E',
                  backgroundColor: selected ? `${pose.badgeColorHex}33` : '#17223B',
                  color: selected ? pose.badgeColorHex : '#FFFFFF',
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selected ? 'font-bold border-[1.5px]' : 'font-normal hover:bg-[#1D2A44]'
                }`}
              >
                {pose.titleKo}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Multimodal Conversation Log with Milo */}
      <div className="flex flex-col gap-2.5 flex-1 min-h-[220px] rounded-2xl bg-[#10192D] border border-[#31446B]/60 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#7DD3FC]" />
            <h3 className="text-sm font-bold text-white">
              마일로와 음성·텍스트 공감 다이어리
            </h3>
          </div>
          {isAiThinking && (
            <div className="flex items-center gap-1.5 text-xs text-[#7DD3FC]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>마일로가 생각 중...</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1">
          {chatMessages.slice(-6).map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.senderIsMilo ? 'items-start' : 'items-end'
              }`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-3 border text-sm leading-relaxed ${
                  msg.senderIsMilo
                    ? 'bg-[#192742] border-[#A5B4FC]/35 rounded-bl-sm text-white'
                    : 'bg-[#7DD3FC]/20 border-[#7DD3FC]/55 rounded-br-sm text-white'
                }`}
              >
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span
                    className={`font-semibold ${
                      msg.senderIsMilo ? 'text-[#7DD3FC]' : 'text-[#FCD34D]'
                    }`}
                  >
                    {msg.senderIsMilo ? '마일로 (Milo)' : '나 (사용자)'}
                  </span>
                  <span className="text-[#AEC0DA]" aria-hidden="true">·</span>
                  <span className="text-[#AEC0DA] font-mono tabular-nums">
                    {msg.timestamp}
                  </span>
                </div>
                <div className="text-sm text-[#F8FAFC]">{msg.text}</div>

                {msg.actionCardText && (
                  <div className="mt-2 w-full rounded-lg bg-[#34D399]/15 border border-[#34D399]/45 px-2.5 py-1.5 text-xs text-[#34D399] font-medium">
                    {msg.actionCardText}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 4. Voice & Text Input Row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1 mt-auto">
          <button
            type="button"
            onClick={onToggleVoiceMode}
            data-testid="chat_mic_button"
            title="음성으로 말하기"
            className={`p-2.5 rounded-xl border transition-colors shrink-0 cursor-pointer ${
              isVoiceActive
                ? 'bg-[#FB7185]/25 border-[#FB7185] text-[#FB7185]'
                : 'bg-[#1E293B] border-[#31446B] text-[#7DD3FC] hover:bg-[#283548]'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="예: 오늘 아침에 마운자로 5mg 맞았는데 속이 울렁거려"
            data-testid="milo_chat_input"
            className="flex-1 min-w-0 rounded-xl bg-[#0B111E] border border-[#31446B] px-3 py-2 text-sm text-white placeholder-[#AEC0DA]/60 focus:outline-none focus:border-[#7DD3FC]"
          />

          <button
            type="submit"
            data-testid="milo_chat_send_button"
            className="flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-[#7DD3FC] hover:bg-[#38BDF8] text-[#042F49] font-bold text-sm transition-colors shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
