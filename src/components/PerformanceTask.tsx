import React, { useState } from 'react';
import { performanceChallenges } from '../data/lessonData';
import { runNestedLoopPython } from '../utils/pythonRunner';
import { Play, Send, Terminal, CheckCircle2, AlertTriangle, Code2 } from 'lucide-react';

interface PerformanceTaskProps {
  savedTask: {
    challengeId: string;
    challengeTitle: string;
    code: string;
    output: string;
    submittedAt: number;
  } | null;
  onSubmitTask: (task: {
    challengeId: string;
    challengeTitle: string;
    code: string;
    output: string;
    submittedAt: number;
  }) => void;
}

export const PerformanceTask: React.FC<PerformanceTaskProps> = ({
  savedTask,
  onSubmitTask,
}) => {
  const [selectedId, setSelectedId] = useState(
    savedTask?.challengeId || performanceChallenges[0].id
  );
  const currentChallenge =
    performanceChallenges.find((c) => c.id === selectedId) || performanceChallenges[0];

  const [code, setCode] = useState(savedTask?.code || currentChallenge.starterCode);
  const [runResult, setRunResult] = useState(() =>
    runNestedLoopPython(savedTask?.code || currentChallenge.starterCode)
  );
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleSelectChallenge = (id: string) => {
    const ch = performanceChallenges.find((c) => c.id === id);
    if (!ch) return;
    setSelectedId(id);
    setCode(ch.starterCode);
    setRunResult(runNestedLoopPython(ch.starterCode));
  };

  const handleRun = () => {
    setRunResult(runNestedLoopPython(code));
  };

  const handleSubmit = () => {
    const result = runNestedLoopPython(code);
    setRunResult(result);
    if (!result.success) return;
    onSubmitTask({
      challengeId: currentChallenge.id,
      challengeTitle: currentChallenge.title,
      code,
      output: result.output,
      submittedAt: Date.now(),
    });
    setSubmittedNotice(true);
    window.setTimeout(() => setSubmittedNotice(false), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white">المهمة الأدائية البرمجية (تطبيق عملي)</h2>
            <p className="text-sm text-slate-400 mt-1">
              اختاري التحدي البرمجي، عدّلي الكود أو اكتبيه بنفسكِ، شغّليه للتأكد من المخرجات، ثم أرسليه مباشرة إلى صفحة المعلمة.
            </p>
          </div>
          {savedTask && (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم تسليم المهمة: {savedTask.challengeTitle}</span>
            </div>
          )}
        </div>

        {/* Challenge Selector */}
        <div className="grid md:grid-cols-3 gap-3">
          {performanceChallenges.map((ch) => {
            const active = ch.id === selectedId;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => handleSelectChallenge(ch.id)}
                className={`p-4 rounded-xl border text-right transition cursor-pointer ${
                  active
                    ? 'bg-cyan-500/15 border-cyan-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm">{ch.title}</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ch.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor + Output */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>محرر المهمة الأدائية (Python)</span>
            </span>
            <span>تلميح المخرجات: ٤ مسافات بادئة لكل مستوى</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full p-4 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 focus:outline-none font-mono text-sm text-cyan-200 leading-relaxed"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRun}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition cursor-pointer"
            >
              <Play className="w-4 h-4 text-cyan-400" />
              <span>تشغيل واختبار الكود</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!runResult.success}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال المهمة الأدائية للمعلمة</span>
            </button>

            {submittedNotice && (
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>وصلت مهمتكِ بنجاح إلى لوحة المعلمة!</span>
              </span>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#0E1525] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>المخرجات الناتجة</span>
              </span>
              <span className="font-mono">{runResult.linesCount} صفوف</span>
            </div>

            {runResult.success ? (
              <pre className="p-4 rounded-xl bg-[#020617] border border-slate-800 font-mono text-sm text-emerald-300 leading-relaxed whitespace-pre-wrap min-h-[180px]">
                {runResult.output}
              </pre>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-700/50 text-rose-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{runResult.error}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-amber-300">المخرج المتوقع للتحدي:</div>
            <pre className="font-mono text-xs text-slate-400 whitespace-pre-wrap">
              {currentChallenge.expectedHint}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
