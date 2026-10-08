/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_TEAMS, FRAGMENTS, DEEP_QUESTIONS } from './data/poemData';
import { Team, Fragment } from './types';
import { audioService } from './services/audioService';

import { Header } from './components/Header';
import { TeamScoreboard } from './components/TeamScoreboard';
import { VillageSoulColumn } from './components/VillageSoulColumn';

import { Stage1Shore } from './components/stages/Stage1Shore';
import { Stage2Voyage } from './components/stages/Stage2Voyage';
import { Stage3Sail } from './components/stages/Stage3Sail';
import { StageAIThinking } from './components/stages/StageAIThinking';
import { Stage4Harbor } from './components/stages/Stage4Harbor';
import { Stage5Microscope } from './components/stages/Stage5Microscope';
import { Stage6Longing } from './components/stages/Stage6Longing';

import { ReflectionModal } from './components/modals/ReflectionModal';
import { TeacherDeepExplainModal } from './components/modals/TeacherDeepExplainModal';
import { GuideModal } from './components/modals/GuideModal';
import { FullPoemModal } from './components/modals/FullPoemModal';
import { GrandFinaleModal } from './components/modals/GrandFinaleModal';

export default function App() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState<number>(1);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [unlockedStages, setUnlockedStages] = useState<number>(1);
  const [fragmentsUnlocked, setFragmentsUnlocked] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [aiStageCompleted, setAiStageCompleted] = useState<boolean>(false);

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceRate, setVoiceRate] = useState<number>(1.0);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    return audioService.subscribe((speaking, paused, _text, gender) => {
      setIsSpeaking(speaking);
      setIsPaused(paused);
      setVoiceGender(gender);
    });
  }, []);

  // Modals state
  const [activeFragmentModal, setActiveFragmentModal] = useState<Fragment | null>(null);
  const [showTeacherDeep, setShowTeacherDeep] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showPoem, setShowPoem] = useState<boolean>(false);
  const [showFinale, setShowFinale] = useState<boolean>(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; icon: string } | null>(null);

  // Sound and speed handlers
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setSoundEnabled(next);
    showToastNotification(next ? 'Âm thanh đã bật' : 'Âm thanh đã tắt', next ? '🔊' : '🔇');
  };

  const handleSetRate = (rate: number) => {
    setVoiceRate(rate);
    audioService.setRate(rate);
    showToastNotification(`Tốc độ giọng đọc: ${rate}x`, '🎙️');
  };

  const handleToggleVoiceGender = (gender: 'female' | 'male') => {
    setVoiceGender(gender);
    audioService.setVoiceGender(gender);
    showToastNotification(
      gender === 'female'
        ? 'Đã chọn: Giọng nữ Miền Bắc (Hoài My)'
        : 'Đã chọn: Giọng nam Miền Bắc (Nam Minh)',
      gender === 'female' ? '👩' : '👨'
    );
  };

  const showToastNotification = (message: string, icon = '✨') => {
    setToast({ message, icon });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 2800);
  };

  // Score modification
  const handleModifyScore = (teamId: number, points: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, t.score + points) } : t))
    );
    if (points > 0) {
      if (points >= 10) audioService.playCorrect();
      else audioService.playBonus();
      showToastNotification(`Đội ${teamId} +${points} điểm!`, '🌟');
    }
  };

  const handleAwardActiveTeam = (points: number, reason: string) => {
    handleModifyScore(activeTeamId, points);
    showToastNotification(`${reason} +${points} điểm cho Đội ${activeTeamId}`, '🎉');
  };

  // Stage Completion & Fragment Unlocking Flow
  const handleStageComplete = (stageNum: number) => {
    if (stageNum === 3.5) {
      setAiStageCompleted(true);
      setCurrentStage(4);
      setUnlockedStages((prev) => Math.max(prev, 4));
      return;
    }

    const fragIndex = stageNum - 1;
    audioService.playUnlock();

    // Mark fragment as unlocked
    setFragmentsUnlocked((prev) => {
      const next = [...prev];
      next[fragIndex] = true;
      return next;
    });

    // Show reflection modal
    const fragment = FRAGMENTS[fragIndex];
    if (fragment) {
      setActiveFragmentModal(fragment);
    }
  };

  const handleCloseReflectionAndProceed = () => {
    setActiveFragmentModal(null);
    audioService.stop();

    if (currentStage === 3 && !aiStageCompleted) {
      setCurrentStage(3.5);
    } else if (currentStage < 6) {
      const nextStage = currentStage === 3.5 ? 4 : currentStage + 1;
      setCurrentStage(nextStage);
      setUnlockedStages((prev) => Math.max(prev, nextStage));
    } else {
      // Completed all 6 stages -> Finale!
      setShowFinale(true);
    }
  };

  // Skip stage when answering incorrectly or wishing to proceed without awarding points
  const handleSkipStage = (stageNum: number) => {
    audioService.stop();
    const stageLabel = stageNum === 3.5 ? 'Trạm AI' : `Chặng ${stageNum}`;
    showToastNotification(`Đã chuyển qua chặng tiếp theo (0 điểm cho ${stageLabel})`, '⏭️');

    if (stageNum === 3.5) {
      setAiStageCompleted(true);
      setCurrentStage(4);
      setUnlockedStages((prev) => Math.max(prev, 4));
    } else if (stageNum === 3) {
      if (!aiStageCompleted) {
        setCurrentStage(3.5);
      } else {
        setCurrentStage(4);
        setUnlockedStages((prev) => Math.max(prev, 4));
      }
    } else if (stageNum < 6) {
      const nextStage = stageNum + 1;
      setCurrentStage(nextStage);
      setUnlockedStages((prev) => Math.max(prev, nextStage));
    } else {
      // Completed all stages -> Finale
      setShowFinale(true);
    }
  };

  const handleResetGame = () => {
    if (window.confirm('Em có chắc chắn muốn đặt lại hải trình từ đầu không?')) {
      audioService.stop();
      setCurrentStage(1);
      setUnlockedStages(1);
      setTeams(INITIAL_TEAMS);
      setFragmentsUnlocked([false, false, false, false, false, false]);
      setAiStageCompleted(false);
      setShowFinale(false);
      setActiveFragmentModal(null);
      showToastNotification('Hải trình đã được đặt lại từ đầu!', '🔄');
    }
  };

  // Read Stage Question with Northern male voice
  const handleSpeakCurrentStage = () => {
    let questionText = '';
    if (currentStage === 1) {
      questionText =
        'Những chi tiết nào giúp em nhận biết quê hương của tác giả là một làng chài ven biển?';
    } else if (currentStage === 2) {
      questionText =
        'Chọn các động từ mạnh biểu hiện khí thế ra khơi để tiếp thêm sức mạnh cho con thuyền vượt sóng!';
    } else if (currentStage === 3) {
      questionText =
        'Chọn tất cả các tầng nghĩa đúng của câu thơ: Cánh buồm giương to như mảnh hồn làng.';
    } else if (currentStage === 3.5) {
      questionText =
        'Trợ lý AI nhận định rằng cánh buồm giương to như mảnh hồn làng chỉ đơn thuần miêu tả kích thước cánh buồm rất lớn. Em có đồng ý không?';
    } else if (currentStage === 4) {
      questionText =
        'Không khí bến cá ngày trở về cho em cảm nhận gì về cuộc sống của người dân làng chài?';
    } else if (currentStage === 5) {
      questionText =
        'Hãy phân loại các từ ngữ đặc sắc vào hai đối tượng: Người dân chài và Con thuyền!';
    } else if (currentStage === 6) {
      questionText =
        'Tại sao bài thơ Quê hương lại kết thúc bằng nỗi nhớ về một mùi hương nồng mặn?';
    }

    audioService.speak(questionText);
  };

  // Helper labels
  const getStageHeaders = () => {
    if (currentStage === 1) {
      return { icon: '🏝️', sub: 'CHẶNG 1 TRÊN 6 • BỜ BIỂN', title: 'DẤU VẾT LÀNG CHÀI' };
    }
    if (currentStage === 2) {
      return { icon: '⛵', sub: 'CHẶNG 2 TRÊN 6 • RA KHƠI', title: 'ĐƯA THUYỀN RA KHƠI' };
    }
    if (currentStage === 3) {
      return { icon: '🕊️', sub: 'CHẶNG 3 TRÊN 6 • CÁNH BUỒM', title: 'MẢNH HỒN LÀNG' };
    }
    if (currentStage === 3.5) {
      return { icon: '🤖', sub: 'TRẠM TƯ DUY SỐ • ĐẶC BIỆT', title: 'AI CÓ THỰC SỰ HIỂU THƠ?' };
    }
    if (currentStage === 4) {
      return { icon: '🐟', sub: 'CHẶNG 4 TRÊN 6 • TRỞ VỀ', title: 'BẾN CÁ NGÀY TRỞ VỀ' };
    }
    if (currentStage === 5) {
      return { icon: '🔬', sub: 'CHẶNG 5 TRÊN 6 • CON NGƯỜI', title: 'KÍNH HIỂN VI NGÔN TỪ' };
    }
    return {
      icon: '🌅',
      sub: 'CHẶNG 6 TRÊN 6 • NỖI NHỚ',
      title: 'NỖI NHỚ CÓ MÀU, CÓ HÌNH, CÓ MÙI',
    };
  };

  const headers = getStageHeaders();
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];
  const deepQuestionPrompt =
    DEEP_QUESTIONS[currentStage === 3.5 ? 'ai' : currentStage] ||
    'Hãy chỉ rõ câu thơ / từ ngữ trong bài chứng minh cho câu trả lời của đội em?';

  return (
    <div className="game-wrapper">
      <div className="aspect-16-9-box text-white">
        {/* Animated Ocean Wave Background Layers */}
        <div className="ocean-wave-bg" />
        <div className="ocean-wave-bg layer2" />

        {/* Ambient Seabirds */}
        <div className="seabird" style={{ top: '14%' }}>
          <svg
            width="34"
            height="18"
            viewBox="0 0 50 25"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M2,18 Q12,2 25,12 Q38,2 48,18" />
          </svg>
        </div>
        <div className="seabird" style={{ top: '22%', animationDelay: '-16s' }}>
          <svg
            width="24"
            height="14"
            viewBox="0 0 50 25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M2,18 Q12,2 25,12 Q38,2 48,18" />
          </svg>
        </div>

        {/* ==================== HEADER BAR ==================== */}
        <Header
          currentStage={currentStage}
          unlockedStages={unlockedStages}
          soundEnabled={soundEnabled}
          voiceRate={voiceRate}
          voiceGender={voiceGender}
          onToggleSound={handleToggleSound}
          onSetRate={handleSetRate}
          onToggleVoiceGender={handleToggleVoiceGender}
          onOpenGuide={() => setShowGuide(true)}
          onOpenPoem={() => setShowPoem(true)}
          onResetGame={handleResetGame}
        />

        {/* ==================== MAIN 3-COLUMN BODY ==================== */}
        <div className="flex-1 flex overflow-hidden relative z-10 p-2 sm:p-3 gap-2 sm:gap-3">
          {/* LEFT: 4 Teams Scoreboard */}
          <TeamScoreboard
            teams={teams}
            activeTeamId={activeTeamId}
            onSelectTeam={setActiveTeamId}
            onModifyScore={handleModifyScore}
            onOpenDeepExplain={() => setShowTeacherDeep(true)}
          />

          {/* CENTER: Stage Challenge Canvas */}
          <main className="flex-1 bg-slate-900/75 backdrop-blur-md rounded-2xl border border-sky-500/40 flex flex-col overflow-hidden relative shadow-2xl">
            {/* Stage Title Tab */}
            <div className="bg-slate-950/60 px-4 py-2 border-b border-sky-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{headers.icon}</span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                    {headers.sub}
                  </span>
                  <h1 className="text-sm sm:text-base font-extrabold text-amber-400 leading-tight">
                    {headers.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isSpeaking ? (
                  <div className="flex items-center space-x-1 bg-sky-950/90 p-1 rounded-lg border border-amber-400/60 shadow">
                    <button
                      onClick={() => audioService.togglePause()}
                      className="p-1 px-2.5 rounded bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 text-xs font-bold flex items-center space-x-1 cursor-pointer transition active:scale-95"
                      title={isPaused ? 'Tiếp tục đọc đề' : 'Tạm dừng đọc đề'}
                    >
                      <span>{isPaused ? '▶' : '⏸'}</span>
                      <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
                    </button>
                    <button
                      onClick={() => audioService.stop()}
                      className="p-1 px-2 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold cursor-pointer transition"
                      title="Dừng đọc đề"
                    >
                      <span>⏹</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSpeakCurrentStage}
                    className="p-1.5 px-3 rounded-lg bg-sky-950/80 hover:bg-sky-850 text-cyan-100 text-xs font-semibold flex items-center space-x-1 border border-sky-400/40 transition cursor-pointer"
                    title="Nghe câu hỏi bằng giọng đọc truyền cảm chuẩn Hà Nội"
                  >
                    <span>🔊</span>
                    <span>Đọc đề</span>
                  </button>
                )}

                <button
                  onClick={() => handleSkipStage(currentStage)}
                  className="p-1.5 px-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center space-x-1 border border-amber-400/40 transition cursor-pointer active:scale-95 shadow-sm"
                  title="Trả lời sai hoặc muốn chuyển sang chặng tiếp theo (Không tính điểm)"
                >
                  <span>⏭️</span>
                  <span>Chuyển chặng (0đ)</span>
                </button>

                <div className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-semibold">
                  Đang thử thách
                </div>
              </div>
            </div>

            {/* Dynamic Stage Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col justify-between relative">
              {currentStage === 1 && (
                <Stage1Shore
                  onStageComplete={() => handleStageComplete(1)}
                  onSkipStage={() => handleSkipStage(1)}
                  onAwardPoints={handleAwardActiveTeam}
                  onShowToast={showToastNotification}
                />
              )}
              {currentStage === 2 && (
                <Stage2Voyage
                  onStageComplete={() => handleStageComplete(2)}
                  onSkipStage={() => handleSkipStage(2)}
                  onAwardPoints={handleAwardActiveTeam}
                  onShowToast={showToastNotification}
                />
              )}
              {currentStage === 3 && (
                <Stage3Sail
                  onStageComplete={() => handleStageComplete(3)}
                  onSkipStage={() => handleSkipStage(3)}
                  onAwardPoints={handleAwardActiveTeam}
                  onShowToast={showToastNotification}
                />
              )}
              {currentStage === 3.5 && (
                <StageAIThinking
                  onStageComplete={() => handleStageComplete(3.5)}
                  onSkipStage={() => handleSkipStage(3.5)}
                  onAwardPoints={handleAwardActiveTeam}
                  onShowToast={showToastNotification}
                />
              )}
              {currentStage === 4 && (
                <Stage4Harbor
                  onStageComplete={() => handleStageComplete(4)}
                  onSkipStage={() => handleSkipStage(4)}
                  onAwardPoints={handleAwardActiveTeam}
                  onShowToast={showToastNotification}
                />
              )}
              {currentStage === 5 && (
                <Stage5Microscope
                  onStageComplete={() => handleStageComplete(5)}
                  onSkipStage={() => handleSkipStage(5)}
                  onAwardPoints={handleAwardActiveTeam}
                  onShowToast={showToastNotification}
                />
              )}
              {currentStage === 6 && (
                <Stage6Longing
                  onStageComplete={() => handleStageComplete(6)}
                  onSkipStage={() => handleSkipStage(6)}
                  onAwardPoints={handleAwardActiveTeam}
                  onShowToast={showToastNotification}
                />
              )}
            </div>
          </main>

          {/* RIGHT: Village Soul Illuminated Sail Column */}
          <VillageSoulColumn
            fragments={FRAGMENTS}
            unlockedList={fragmentsUnlocked}
            allCompleted={fragmentsUnlocked.every(Boolean)}
            onSelectFragment={(frag) => setActiveFragmentModal(frag)}
          />
        </div>

        {/* ==================== POPUP MODALS ==================== */}

        {/* 1. Fragment Unlocked Pedagogical Modal */}
        {activeFragmentModal && (
          <ReflectionModal
            fragment={activeFragmentModal}
            onCloseAndProceed={handleCloseReflectionAndProceed}
          />
        )}

        {/* 2. Teacher Deep Explain Modal */}
        {showTeacherDeep && (
          <TeacherDeepExplainModal
            questionPrompt={deepQuestionPrompt}
            activeTeamName={activeTeam.name}
            onConfirmAward={() => {
              setShowTeacherDeep(false);
              handleModifyScore(activeTeamId, 5);
              showToastNotification(`Đội ${activeTeamId} nhận +5 điểm trả lời sâu sắc!`, '🎖️');
            }}
            onClose={() => setShowTeacherDeep(false)}
          />
        )}

        {/* 3. Guide Modal */}
        {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

        {/* 4. Full Poem Recitation Modal */}
        {showPoem && <FullPoemModal onClose={() => setShowPoem(false)} />}

        {/* 5. Grand Finale Modal */}
        {showFinale && (
          <GrandFinaleModal
            teams={teams}
            onResetGame={handleResetGame}
            onReviewSail={() => setShowFinale(false)}
          />
        )}

        {/* 6. Toast Notification */}
        {toast && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 border-2 border-emerald-400 text-white shadow-2xl flex items-center space-x-2 transition duration-300 animate-fadeIn">
            <span className="text-lg">{toast.icon}</span>
            <span className="text-xs sm:text-sm font-bold">{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
