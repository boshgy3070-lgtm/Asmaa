import React, { useState } from 'react';
import { peerAssessmentItems, rubricCriteria, selfAssessmentItems } from '../data/lessonData';
import { RubricEvaluation, StudentRecord } from '../types/lesson';
import { CheckCircle2, Star, Sparkles, Users, Send, Ticket } from 'lucide-react';

interface ReflectionAndClosureProps {
  student: StudentRecord;
  classmates: StudentRecord[];
  onSaveSelfAssessment: (ratings: Record<string, number>, note: string) => void;
  onSavePeerAssessment: (peerName: string, ratings: Record<string, number>, praise: string) => void;
  onSaveTwoStarsWish: (star1: string, star2: string, wish: string) => void;
  onSaveExitTicket: (learned: string, realLifeLink: string, moodEmoji: string, moodLabel: string) => void;
  initialSubTab?: 'self-peer' | 'rubric' | 'stars-wish' | 'exit';
}

const EXIT_MOODS = [
  { emoji: '🤩', label: 'ممتعة وملهمة جداً' },
  { emoji: '🚀', label: 'فهمت ومتحمسة للتطبيق' },
  { emoji: '😊', label: 'واضحة ومريحة' },
  { emoji: '🤔', label: 'أحتاج مراجعة بسيطة' },
];

export const ReflectionAndClosure: React.FC<ReflectionAndClosureProps> = ({
  student,
  classmates,
  onSaveSelfAssessment,
  onSavePeerAssessment,
  onSaveTwoStarsWish,
  onSaveExitTicket,
  initialSubTab = 'self-peer',
}) => {
  const [subTab, setSubTab] = useState<'self-peer' | 'rubric' | 'stars-wish' | 'exit'>(initialSubTab);

  // Self assessment
  const [selfRatings, setSelfRatings] = useState<Record<string, number>>(
    student.selfAssessment?.ratings || { concept: 4, trace: 4, indent: 4, patterns: 4 }
  );
  const [selfNote, setSelfNote] = useState(student.selfAssessment?.note || '');
  const [selfSaved, setSelfSaved] = useState(false);

  // Peer assessment
  const [peerName, setPeerName] = useState(student.peerAssessment?.peerName || '');
  const [peerRatings, setPeerRatings] = useState<Record<string, number>>(
    student.peerAssessment?.ratings || { coop: 4, explain: 4, commit: 4 }
  );
  const [peerPraise, setPeerPraise] = useState(student.peerAssessment?.praise || '');
  const [peerSaved, setPeerSaved] = useState(false);

  // Two stars & a wish
  const [star1, setStar1] = useState(student.twoStarsAndWish?.star1 || '');
  const [star2, setStar2] = useState(student.twoStarsAndWish?.star2 || '');
  const [wish, setWish] = useState(student.twoStarsAndWish?.wish || '');
  const [starsSaved, setStarsSaved] = useState(false);

  // Exit ticket
  const [learned, setLearned] = useState(student.exitTicket?.learned || '');
  const [realLifeLink, setRealLifeLink] = useState(student.exitTicket?.realLifeLink || '');
  const [moodIdx, setMoodIdx] = useState(() => {
    const found = EXIT_MOODS.findIndex((m) => m.emoji === student.exitTicket?.moodEmoji);
    return found >= 0 ? found : 0;
  });
  const [exitSaved, setExitSaved] = useState(false);

  const ratingLabels = ['١: مبتدئة', '٢: نامية', '٣: جيدة', '٤: متقنة'];

  const renderTeacherRubric = (rubric: RubricEvaluation | null) => {
    if (!rubric) {
      return (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          لم ترصد المعلمة سلم التقدير الفردي بعد. بمجرد تقييم المعلمة لمهمتكِ سيظهر هنا تلقائياً.
        </div>
      );
    }
    const total = rubric.understanding + rubric.indentation + rubric.problemSolving + rubric.collaboration;
    return (
      <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-bold text-sm text-emerald-300">
            تقييم المعلمة المرصود ({rubric.evaluatedBy})
          </div>
          <div className="font-mono font-extrabold text-base text-white tabular-nums">
            المجموع: {total} / 12
          </div>
        </div>
        {rubric.note && <p className="text-xs text-slate-200">ملاحظة المعلمة: {rubric.note}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { id: 'self-peer' as const, label: 'التقييم الذاتي والأقران' },
          { id: 'rubric' as const, label: 'سلم التقدير' },
          { id: 'stars-wish' as const, label: 'نجمتان وأمنية' },
          { id: 'exit' as const, label: 'بطاقة الخروج (ختام الدرس)' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSubTab(item.id)}
            className={`py-3 px-4 rounded-xl border text-xs md:text-sm font-bold transition cursor-pointer ${
              subTab === item.id
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-[#0E1525] border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 1. Self & Peer Assessment */}
      {subTab === 'self-peer' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Self Assessment */}
          <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white">التقييم الذاتي للطالبة</h3>
              {selfSaved && (
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم الحفظ</span>
                </span>
              )}
            </div>

            <div className="space-y-4">
              {selfAssessmentItems.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="text-sm font-semibold text-slate-200">{item.text}</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelfRatings((p) => ({ ...p, [item.id]: val }))}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          selfRatings[item.id] === val
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {ratingLabels[val - 1]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <textarea
              value={selfNote}
              onChange={(e) => setSelfNote(e.target.value)}
              rows={2}
              placeholder="ملاحظة شخصية حول ما أتقنتِه أو ما تحتاجين مراجعته..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500"
            />

            <button
              type="button"
              onClick={() => {
                onSaveSelfAssessment(selfRatings, selfNote);
                setSelfSaved(true);
                window.setTimeout(() => setSelfSaved(false), 3000);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm transition cursor-pointer"
            >
              إرسال التقييم الذاتي للمعلمة
            </button>
          </div>

          {/* Peer Assessment */}
          <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>تقييم الأقران</span>
              </h3>
              {peerSaved && (
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم الإرسال</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">اسم الزميلة المُقيَّمة</label>
              <input
                type="text"
                value={peerName}
                onChange={(e) => setPeerName(e.target.value)}
                placeholder="اكتبي اسم زميلتكِ أو اختاري من القائمة..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
              {classmates.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {classmates.slice(0, 8).map((cm) => (
                    <button
                      key={cm.id}
                      type="button"
                      onClick={() => setPeerName(cm.name)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer"
                    >
                      {cm.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {peerAssessmentItems.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="text-sm font-semibold text-slate-200">{item.text}</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPeerRatings((p) => ({ ...p, [item.id]: val }))}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          peerRatings[item.id] === val
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {ratingLabels[val - 1]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <textarea
              value={peerPraise}
              onChange={(e) => setPeerPraise(e.target.value)}
              rows={2}
              placeholder="رسالة شكر أو نقطة تميز لزميلتكِ..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500"
            />

            <button
              type="button"
              onClick={() => {
                if (!peerName.trim()) return;
                onSavePeerAssessment(peerName.trim(), peerRatings, peerPraise.trim());
                setPeerSaved(true);
                window.setTimeout(() => setPeerSaved(false), 3000);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition cursor-pointer"
            >
              إرسال تقييم الأقران للمعلمة
            </button>
          </div>
        </div>
      )}

      {/* 2. Rubric */}
      {subTab === 'rubric' && (
        <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-white">سلم التقدير التحليلي للدرس (Rubric)</h3>
            <p className="text-xs text-slate-400 mt-1">
              المعايير المعتمدة من المعلمتين أ. أسماء قيسي وأ. أسماء صميلي لتقويم إتقان الحلقات المتداخلة.
            </p>
          </div>

          {renderTeacherRubric(student.rubricEvaluation)}

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-right text-xs md:text-sm">
              <thead className="bg-slate-900 text-cyan-300">
                <tr>
                  <th className="p-3.5 border-b border-slate-800">المعيار (الوزن)</th>
                  <th className="p-3.5 border-b border-slate-800 text-emerald-300">متقنة (٣)</th>
                  <th className="p-3.5 border-b border-slate-800 text-cyan-300">متقدمة (٢)</th>
                  <th className="p-3.5 border-b border-slate-800 text-amber-300">قيد التطوير (١)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rubricCriteria.map((crit) => {
                  const earned = student.rubricEvaluation?.[crit.id];
                  return (
                    <tr key={crit.id} className="bg-slate-950/40">
                      <td className="p-3.5 font-bold text-white align-top">
                        <div>{crit.title}</div>
                        <div className="text-xs text-slate-400 mt-1">الوزن: {crit.weight}</div>
                      </td>
                      {crit.levels.map((lvl) => (
                        <td
                          key={lvl.score}
                          className={`p-3.5 align-top text-slate-300 leading-relaxed ${
                            earned === lvl.score ? 'bg-emerald-500/15 text-white font-semibold' : ''
                          }`}
                        >
                          {lvl.description}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Two Stars and a Wish */}
      {subTab === 'stars-wish' && (
        <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white">استراتيجية نجمتان وأمنية</h3>
              <p className="text-xs text-slate-400 mt-1">
                اكتبي نقطتين أبدعتِ فيهما اليوم في درس الحلقات المتداخلة، وأمنية برمجية تطمحين لتحقيقها.
              </p>
            </div>
            {starsSaved && (
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>وصلت للمعلمة</span>
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-300" />
                <span>النجمة الأولى (نقطة قوة أتقنتُها)</span>
              </label>
              <input
                type="text"
                value={star1}
                onChange={(e) => setStar1(e.target.value)}
                placeholder="مثال: أتقنتُ تتبع قيم الحلقة الخارجية والداخلية..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-300" />
                <span>النجمة الثانية (إنجاز حققتُه اليوم)</span>
              </label>
              <input
                type="text"
                value={star2}
                onChange={(e) => setStar2(e.target.value)}
                placeholder="مثال: اكتشفتُ تأثير المسافة البادئة على عدد التكرارات..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>الأمنية (مهارة أتمنى تطويرها مستقبلاً)</span>
              </label>
              <input
                type="text"
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="مثال: أتمنى تصميم ساعة رقمية أو لعبة صغيرة بلغة بايثون..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!star1.trim() || !star2.trim() || !wish.trim()) return;
              onSaveTwoStarsWish(star1.trim(), star2.trim(), wish.trim());
              setStarsSaved(true);
              window.setTimeout(() => setStarsSaved(false), 3000);
            }}
            className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm transition cursor-pointer"
          >
            إرسال نجمتان وأمنية للمعلمة
          </button>
        </div>
      )}

      {/* 4. Exit Ticket (Closure) */}
      {subTab === 'exit' && (
        <div className="bg-[#0E1525] border border-cyan-500/30 rounded-2xl p-6 md:p-8 space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">ختام الدرس: بطاقة الخروج الرقمية</h3>
                <p className="text-xs text-slate-400">
                  تذكرتكِ الذهبية لإنهاء الحصة ومشاركة خلاصة تعلمكِ مع معلمتيكِ.
                </p>
              </div>
            </div>
            {exitSaved && (
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم تسليم البطاقة</span>
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-200 block">
                ١. في جملة مركزة: ما أهم قاعدة تعلمتِها اليوم في الحلقات المتداخلة؟
              </label>
              <textarea
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                rows={2}
                placeholder="مثال: الحلقة الداخلية تكتمل أولاً لكل دورة من الحلقة الخارجية، والمسافة البادئة تحدد تبعية الأوامر..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-200 block">
                ٢. أعطي مثالاً من واقع حياتكِ أو موادكِ الدراسية يشبه الحلقات المتداخلة:
              </label>
              <input
                type="text"
                value={realLifeLink}
                onChange={(e) => setRealLifeLink(e.target.value)}
                placeholder="مثال: أيام الأسبوع (٧) وبداخل كل يوم (٥) صلوات، أو الصفوف والمقاعد في الفصل..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200 block">
                ٣. عبّري عن شعوركِ وتقييمكِ للحصة اليوم:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {EXIT_MOODS.map((m, idx) => (
                  <button
                    key={m.emoji}
                    type="button"
                    onClick={() => setMoodIdx(idx)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      moodIdx === idx
                        ? 'bg-cyan-500/20 border-cyan-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.emoji}</div>
                    <div className="text-xs font-bold">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!learned.trim()) return;
              const mood = EXIT_MOODS[moodIdx];
              onSaveExitTicket(learned.trim(), realLifeLink.trim(), mood.emoji, mood.label);
              setExitSaved(true);
              window.setTimeout(() => setExitSaved(false), 3000);
            }}
            className="w-full py-3.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>إرسال بطاقة الخروج للمعلمة</span>
          </button>
        </div>
      )}
    </div>
  );
};
