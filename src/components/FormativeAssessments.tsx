import React, { useState } from 'react';
import { formativeActivities } from '../data/lessonData';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface FormativeAssessmentsProps {
  savedAnswers?: Record<string, { answer: string; isCorrect: boolean; score: number }>;
  onAnswerSubmit?: (questionId: string, answer: string, isCorrect: boolean) => void;
}

export const FormativeAssessments: React.FC<FormativeAssessmentsProps> = ({
  savedAnswers = {},
  onAnswerSubmit,
}) => {
  const activities = [
    formativeActivities.q1,
    formativeActivities.q2,
    formativeActivities.q3,
    formativeActivities.q4,
  ];

  const [localSelections, setLocalSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const [k, v] of Object.entries(savedAnswers)) {
      init[k] = v.answer;
    }
    return init;
  });

  const handleSelect = (qId: string, option: string, correct: string) => {
    setLocalSelections((prev) => ({ ...prev, [qId]: option }));
    onAnswerSubmit?.(qId, option, option === correct);
  };

  const answeredCount = Object.keys(localSelections).length;
  const correctCount = activities.filter((a) => localSelections[a.id] === a.correct).length;

  return (
    <div className="space-y-6">
      <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">التقييمات التكوينية التفاعلية</h2>
          <p className="text-sm text-slate-400 mt-1">
            أجيبي عن الأنشطة الأربعة لقياس فهمكِ للحلقات المتداخلة والمسافة البادئة، وتصل نتائجكِ فوراً للمعلمة.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold tabular-nums">
          <span className="text-slate-300">المجاب عليها: {answeredCount} / 4</span>
          <span className="text-emerald-300">الصحيحة: {correctCount} / 4</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {activities.map((act) => {
          const chosen = localSelections[act.id];
          const isAnswered = Boolean(chosen);
          const isCorrect = chosen === act.correct;

          return (
            <div
              key={act.id}
              className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{act.title}</span>
                  </span>
                  {isAnswered && (
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>إجابة صحيحة</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>تحتاج مراجعة</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{act.question}</h3>

                <pre className="p-3.5 rounded-xl bg-[#020617] border border-slate-800 font-mono text-xs md:text-sm text-cyan-200 overflow-x-auto">
                  {act.code}
                </pre>

                <div className="space-y-2">
                  {act.options.map((opt) => {
                    const selected = chosen === opt;
                    const optIsCorrect = opt === act.correct;

                    let style =
                      'bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-400';
                    if (isAnswered) {
                      if (optIsCorrect) {
                        style = 'bg-emerald-950/70 border-emerald-500 text-emerald-200';
                      } else if (selected) {
                        style = 'bg-rose-950/70 border-rose-500 text-rose-200';
                      } else {
                        style = 'bg-slate-900/40 border-slate-800/60 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelect(act.id, opt, act.correct)}
                        className={`w-full text-right px-4 py-3 rounded-xl border text-sm font-semibold transition cursor-pointer flex items-center justify-between gap-2 ${style}`}
                      >
                        <span className="font-sans">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAnswered && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300">التغذية الراجعة: </strong>
                  {act.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
