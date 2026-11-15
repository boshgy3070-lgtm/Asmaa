import React, { useState } from 'react';
import { faithNationSubjectLinks } from '../data/lessonData';
import { MEDIA_ASSETS } from '../utils/mediaAssets';
import { BookOpenCheck, CheckCircle2, Send } from 'lucide-react';

interface FaithAndNationProps {
  savedReflection?: string;
  onSaveReflection?: (text: string) => void;
}

export const FaithAndNation: React.FC<FaithAndNationProps> = ({
  savedReflection = '',
  onSaveReflection,
}) => {
  const [reflection, setReflection] = useState(savedReflection);
  const [savedToast, setSavedToast] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    onSaveReflection?.(reflection.trim());
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Vision 2030 Hero Banner */}
      <div className="bg-[#0E1525] border border-slate-800 rounded-2xl overflow-hidden grid lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-center space-y-3">
          <div className="text-xs font-bold text-emerald-300">
            التكامل القيمي والمعرفي · الدين والوطن والمواد الأخرى
          </div>
          <h2 className="text-2xl font-extrabold text-white [text-wrap:balance]">
            الحلقات المتداخلة: من نظام الكون المحكم إلى مشاريع رؤية ٢٠٣٠
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            البرمجة ليست أكواداً جامدة، بل هي انعكاس للنظام الدقيق الذي أودعه الله في الكون، وأداة لصناعة المستقبل الرقمي في وطننا الغالي المملكة العربية السعودية.
          </p>
        </div>

        <div className="lg:col-span-5 relative h-52 lg:h-auto bg-slate-950">
          {!imgError ? (
            <img
              src={MEDIA_ASSETS.vision2030}
              alt="مشهد معماري وتقني لرؤية السعودية 2030"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950 to-slate-900 text-emerald-300 font-bold text-sm">
              رؤية المملكة ٢٠٣٠ — التحول الرقمي
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-l from-[#0E1525]/70 via-transparent to-transparent" />
        </div>
      </div>

      {/* Three Integration Pillars */}
      <div className="grid lg:grid-cols-3 gap-6">
        {faithNationSubjectLinks.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="text-xs text-cyan-300 font-semibold">
                {item.category} · {item.tag}
              </div>
              <h3 className="text-lg font-extrabold text-white">{item.title}</h3>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-300 leading-relaxed">
                {item.verseOrHadith}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-amber-300 flex items-start gap-2">
              <BookOpenCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>سؤال التأمل: {item.reflectionPrompt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Student Reflection Submission */}
      {onSaveReflection && (
        <form
          onSubmit={handleSave}
          className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">تأملي الذاتي في الربط القيمي والوطني</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                اكتبي مثالاً يربط الحلقات المتداخلة بقيمة إسلامية أو بمشروع وطني أو بمادة دراسية أخرى ليظهر لدى معلمتكِ.
              </p>
            </div>
            {savedToast && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم إرسال تأملكِ للمعلمة</span>
              </span>
            )}
          </div>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={3}
            placeholder="مثال: تشبه الحلقات المتداخلة جدول الضرب في الرياضيات أو انتظام مواسم الحج والعمرة في رؤية 2030..."
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm text-white placeholder-slate-500"
          />

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>حفظ وإرسال للمعلمة</span>
          </button>
        </form>
      )}
    </div>
  );
};
