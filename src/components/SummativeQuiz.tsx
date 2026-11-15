import React, { useState } from 'react';
import { LESSON_IDENTITY, summativeQuestions } from '../data/lessonData';
import { ClassSection } from '../types/lesson';
import { Award, CheckCircle2, XCircle, RotateCcw, Printer } from 'lucide-react';

interface SummativeQuizProps {
  studentName: string;
  studentClass: ClassSection;
  savedScore: number | null;
  savedAnswers: Record<number, number>;
  onSubmitQuiz: (score: number, total: number, answers: Record<number, number>) => void;
}

export const SummativeQuiz: React.FC<SummativeQuizProps> = ({
  studentName,
  studentClass,
  savedScore,
  savedAnswers,
  onSubmitQuiz,
}) => {
  const [answers, setAnswers] = useState<Record<number, number>>(savedAnswers || {});
  const [submitted, setSubmitted] = useState(savedScore !== null);

  const handleSelect = (qId: number, idx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
  };

  const calculateScore = () => {
    let score = 0;
    for (const q of summativeQuestions) {
      if (answers[q.id] === q.correctAnswerIndex) score++;
    }
    return score;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setSubmitted(true);
    onSubmitQuiz(score, summativeQuestions.length, answers);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const score = submitted ? (savedScore !== null && Object.keys(answers).length === 0 ? savedScore : calculateScore()) : 0;
  const percentage = Math.round((score / summativeQuestions.length) * 100);
  const allAnswered = summativeQuestions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="space-y-6">
      <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">التقييم الختامي الشامل والشهادة</h2>
          <p className="text-sm text-slate-400 mt-1">
            اختبار من ٦ أسئلة يقيس إتقانكِ لجميع أهداف درس الحلقات المتداخلة، وتظهر درجتكِ فورياً في صفحة المعلمة.
          </p>
        </div>
        <div className="text-sm font-bold text-cyan-300 tabular-nums">
          الأسئلة المجابة: {Object.keys(answers).length} / {summativeQuestions.length}
        </div>
      </div>

      {/* Result & Certificate */}
      {submitted && (
        <div className="bg-gradient-to-br from-[#0B1628] via-[#0F1E36] to-[#0B2228] border border-cyan-500/40 rounded-2xl p-6 md:p-8 space-y-6 print-card">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/70 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs text-cyan-300 font-bold">شهادة إتقان رقمية · {LESSON_IDENTITY.school}</div>
                <h3 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
                  الطالبة: {studentName} ({studentClass})
                </h3>
              </div>
            </div>
            <div className="text-center">
              <div className="font-mono text-3xl font-extrabold text-emerald-300 tabular-nums">
                {score} / {summativeQuestions.length}
              </div>
              <div className="text-xs text-slate-300 tabular-nums">نسبة الإتقان: {percentage}%</div>
            </div>
          </div>

          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            تمنح معلمتا المهارات الرقمية بمتوسطة ديحمة هذه الشهادة للطالبة المبدعة{' '}
            <strong className="text-cyan-300">{studentName}</strong> من فصل{' '}
            <strong className="text-cyan-300">{studentClass}</strong> تقديراً لإتمامها دراسة وتطبيق{' '}
            <strong>«{LESSON_IDENTITY.title}»</strong> بلغة بايثون.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-700/70 text-xs text-slate-300">
            <div>
              إعداد وتدريس تشاركي:{' '}
              <strong className="text-white">أ. أسماء قيسي و أ. أسماء صميلي</strong>
            </div>
            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة</span>
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="grid lg:grid-cols-2 gap-6 no-print">
        {summativeQuestions.map((q) => {
          const picked = answers[q.id];
          const isCorrect = picked === q.correctAnswerIndex;
          return (
            <div key={q.id} className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-cyan-300">السؤال {q.id} · {q.topic}</span>
                {submitted && (
                  <span className={`font-bold flex items-center gap-1 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>{isCorrect ? 'صحيح' : 'خطأ'}</span>
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{q.question}</h3>

              {q.codeSnippet && (
                <pre className="p-3 rounded-xl bg-[#020617] border border-slate-800 font-mono text-xs text-cyan-200 overflow-x-auto">
                  {q.codeSnippet}
                </pre>
              )}

              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  const selected = picked === idx;
                  const right = idx === q.correctAnswerIndex;
                  let style = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-400';
                  if (submitted) {
                    if (right) style = 'bg-emerald-950/70 border-emerald-500 text-emerald-200';
                    else if (selected) style = 'bg-rose-950/70 border-rose-500 text-rose-200';
                    else style = 'bg-slate-900/40 border-slate-800/60 text-slate-500';
                  } else if (selected) {
                    style = 'bg-cyan-500/20 border-cyan-400 text-white';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(q.id, idx)}
                      disabled={submitted}
                      className={`w-full text-right px-4 py-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-cyan-300">التوضيح: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex justify-center no-print">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-base transition cursor-pointer"
          >
            {allAnswered
              ? 'اعتماد وإرسال التقييم الختامي للمعلمة'
              : `أكملي بقية الأسئلة (${Object.keys(answers).length}/${summativeQuestions.length})`}
          </button>
        </div>
      )}
    </div>
  );
};
