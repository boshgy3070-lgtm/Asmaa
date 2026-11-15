import React, { useEffect, useState } from 'react';
import { videoCheckpointsData } from '../data/lessonData';
import { Play, Pause, RotateCcw, CheckCircle2, XCircle, Clock, Code2, Sparkles } from 'lucide-react';

interface VideoIntroProps {
  completedCheckpoints?: Record<number, boolean>;
  onSaveCheckpoint?: (timeSec: number, isCorrect: boolean, totalCorrect: number) => void;
  onCompleteVideo?: () => void;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({
  completedCheckpoints = {},
  onSaveCheckpoint,
  onCompleteVideo,
}) => {
  const totalDuration = 80;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>(completedCheckpoints);

  useEffect(() => {
    setAnsweredMap((prev) => ({ ...prev, ...completedCheckpoints }));
  }, [completedCheckpoints]);

  useEffect(() => {
    if (!isPlaying || activeCheckpoint !== null) return;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;
        const cp = videoCheckpointsData.find(
          (item) => item.timeInSeconds === next && answeredMap[item.timeInSeconds] === undefined
        );
        if (cp) {
          setActiveCheckpoint(cp.timeInSeconds);
          setIsPlaying(false);
        }
        if (next >= totalDuration) {
          setIsPlaying(false);
          onCompleteVideo?.();
          return totalDuration;
        }
        return next;
      });
    }, 650);
    return () => clearInterval(timer);
  }, [isPlaying, activeCheckpoint, answeredMap, onCompleteVideo]);

  const currentScene = (() => {
    if (currentTime < 26) {
      return {
        index: '٠١',
        title: 'المشهد الأول: لغز الساعة الرقمية والزمن المتداخل',
        narration:
          'تأملي ساعة المعصم الرقمية: لا يتغير رقم الدقائق إلا بعد أن تدور حلقة الثواني ٦٠ دورة كاملة! ولا تتغير الساعة إلا بعد ٦٠ دقيقة كاملة. هذه الدورات المتداخلة هي تماماً فكرة الحلقات المتداخلة في البرمجة.',
        accent: 'text-cyan-300',
        codePreview: `for hour in range(24):\n    for min in range(60):\n        for sec in range(60):\n            print(hour, ":", min, ":", sec)`,
      };
    }
    if (currentTime < 54) {
      return {
        index: '٠٢',
        title: 'المشهد الثاني: حلقة داخل حلقة في بايثون (ص ١٥٣)',
        narration:
          'في لغة بايثون، نضع حلقة داخلية مثل for j in range(2) داخل حلقة خارجية مثل for i in range(3). لكل قيمة واحدة للعداد الخارجي i، تكتمل الحلقة الداخلية j مرتين! والنتيجة النهائية ٦ تكرارات منظمة.',
        accent: 'text-emerald-300',
        codePreview: `for i in range(3):\n    for j in range(2):\n        print("i=", i, "j=", j)`,
      };
    }
    return {
      index: '٠٣',
      title: 'المشهد الثالث: سر المسافة البادئة (Indentation)',
      narration:
        'في بايثون، المسافة البادئة هي التي تحدد أي الأوامر يتبع الحلقة الداخلية وأيها يتبع الحلقة الخارجية. مسافة واحدة في المكان الخطأ تغيّر المخطط الانسيابي ومخرجات البرنامج بالكامل!',
        accent: 'text-amber-300',
      codePreview: `a = 4\nwhile a <= 12:\n    for i in range(3):\n        print("a=", a, "i=", i)\n    a = a + 3  # خارج الداخلية`,
    };
  })();

  const activeCpData = videoCheckpointsData.find((c) => c.timeInSeconds === activeCheckpoint);

  const handleSelectCheckpointOption = (idx: number) => {
    if (!activeCpData || selectedOption !== null) return;
    setSelectedOption(idx);
    const isCorrect = idx === activeCpData.correctIndex;
    const nextMap = { ...answeredMap, [activeCpData.timeInSeconds]: isCorrect };
    setAnsweredMap(nextMap);
    const totalCorrect = Object.values(nextMap).filter(Boolean).length;
    onSaveCheckpoint?.(activeCpData.timeInSeconds, isCorrect, totalCorrect);
  };

  const resumeAfterCheckpoint = () => {
    setActiveCheckpoint(null);
    setSelectedOption(null);
    setIsPlaying(true);
  };

  const resetVideo = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveCheckpoint(null);
    setSelectedOption(null);
  };

  const progressPercent = Math.round((currentTime / totalDuration) * 100);
  const completedCount = Object.keys(answeredMap).length;
  const correctCount = Object.values(answeredMap).filter(Boolean).length;

  // Dynamic animated visual counters driven by currentTime
  const demoOuter = Math.floor(currentTime / 12) % 3;
  const demoInner = Math.floor(currentTime / 4) % 2;

  return (
    <div className="space-y-6">
      <div className="bg-[#0E1525] border border-slate-800 rounded-2xl overflow-hidden">
        {/* Video Stage */}
        <div className="relative bg-gradient-to-br from-[#070B14] via-[#0B1426] to-[#081A24] p-6 md:p-8 min-h-[380px] flex flex-col justify-between border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold text-cyan-300">
              المقدمة التفاعلية · المشهد {currentScene.index}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 tabular-nums">
              <span>نقاط التوقف المجابة: {completedCount} / {videoCheckpointsData.length}</span>
              <span aria-hidden="true">·</span>
              <span>صحيحة: {correctCount}</span>
            </div>
          </div>

          {/* Center Animated Visual Simulation */}
          <div className="grid md:grid-cols-12 gap-6 items-center my-6">
            <div className="md:col-span-7 space-y-4">
              <h2 className={`text-xl md:text-2xl font-extrabold ${currentScene.accent} [text-wrap:balance]`}>
                {currentScene.title}
              </h2>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                {currentScene.narration}
              </p>

              {/* Live Animated Loop Indicator */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-300">المحاكاة الحية:</span>
                  <span className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
                    i = {demoOuter}
                  </span>
                  <span className="text-slate-500">←</span>
                  <span className="font-mono text-sm font-bold text-emerald-300 tabular-nums">
                    j = {demoInner}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="bg-[#020617] border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-3 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>مقطع بايثون التوضيحي</span>
                  </span>
                  <span className="font-mono">nested_loop.py</span>
                </div>
                <pre className="font-mono text-xs md:text-sm text-emerald-300 leading-relaxed overflow-x-auto">
                  {currentScene.codePreview}
                </pre>
              </div>
            </div>
          </div>

          {/* Checkpoint Overlay Modal inside Stage */}
          {activeCpData && (
            <div className="absolute inset-0 z-20 bg-[#070B14]/95 backdrop-blur-sm p-6 md:p-8 flex items-center justify-center">
              <div className="max-w-xl w-full bg-[#111827] border border-cyan-500/40 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                  <span>نقطة توقف تفاعلية — اختبري فهمكِ</span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white leading-snug">
                  {activeCpData.question}
                </h3>
                <div className="space-y-2.5">
                  {activeCpData.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === activeCpData.correctIndex;
                    let btnStyle =
                      'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-400';
                    if (selectedOption !== null) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                      } else {
                        btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500';
                      }
                    }
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectCheckpointOption(idx)}
                        disabled={selectedOption !== null}
                        className={`w-full text-right px-4 py-3 rounded-xl border text-sm font-semibold transition flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedOption !== null && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {selectedOption !== null && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs md:text-sm text-cyan-200 bg-cyan-950/40 border border-cyan-800/50 rounded-xl p-3">
                      {activeCpData.feedback}
                    </p>
                    <button
                      type="button"
                      onClick={resumeAfterCheckpoint}
                      className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer"
                    >
                      متابعة الفيديو التفاعلي
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Controls & Timeline Bar */}
          <div className="space-y-3">
            <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'إيقاف مؤقت' : currentTime > 0 ? 'استكمال' : 'تشغيل المقدمة'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetVideo}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة</span>
                </button>
              </div>

              {/* Scene Jump Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: '١. الساعة الرقمية', sec: 0 },
                  { label: '٢. تداخل for', sec: 28 },
                  { label: '٣. المسافة البادئة', sec: 56 },
                ].map((scene) => (
                  <button
                    key={scene.sec}
                    type="button"
                    onClick={() => {
                      setCurrentTime(scene.sec);
                      setActiveCheckpoint(null);
                      setSelectedOption(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
                  >
                    {scene.label}
                  </button>
                ))}
                <span className="font-mono text-xs text-slate-400 tabular-nums px-2">
                  {currentTime}s / {totalDuration}s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
