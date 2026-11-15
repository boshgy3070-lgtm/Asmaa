import React, { useState } from 'react';
import { CLASS_SECTIONS, LESSON_IDENTITY } from '../data/lessonData';
import { ClassSection, TeacherClassFilter } from '../types/lesson';
import { MEDIA_ASSETS } from '../utils/mediaAssets';
import { GraduationCap, ShieldCheck, ArrowLeft, Users, Code2, Sparkles } from 'lucide-react';

interface LoginPortalProps {
  onStudentLogin: (name: string, classRoom: ClassSection) => Promise<void>;
  onTeacherLogin: (teacherName: string, classFilter: TeacherClassFilter) => void;
  onBrowseLessonPlan: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onStudentLogin,
  onTeacherLogin,
  onBrowseLessonPlan,
}) => {
  const [roleTab, setRoleTab] = useState<'student' | 'teacher'>('student');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState<ClassSection>('2م / أ');
  const [teacherName, setTeacherName] = useState('أ. أسماء قيسي');
  const [teacherClass, setTeacherClass] = useState<TeacherClassFilter>('2م / أ');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('الرجاء كتابة اسمكِ الكامل قبل الدخول.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await onStudentLogin(studentName.trim(), studentClass);
    } catch (err: any) {
      setErrorMsg(err.message || 'تعذر تسجيل الدخول، حاولي مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      setErrorMsg('الرجاء إدخال اسم المعلمة.');
      return;
    }
    setErrorMsg('');
    onTeacherLogin(teacherName.trim(), teacherClass);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Main 2-column Hero + Login Split */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Right Column (RTL): Editorial Intro + Technical Artwork */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#0E1525] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300 font-medium">
              <span>{LESSON_IDENTITY.school}</span>
              <span aria-hidden="true">·</span>
              <span>{LESSON_IDENTITY.grade}</span>
              <span aria-hidden="true">·</span>
              <span>{LESSON_IDENTITY.pages}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight [text-wrap:balance]">
              {LESSON_IDENTITY.title}
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
              منصة تعليمية تفاعلية لاستكشاف برمجة الحلقات المتداخلة بلغة بايثون خطوة بخطوة، عبر محطات تعلم ذكية، ومحاكي كود فوري، ومنظومة تقويم متصلة لحظياً بلوحة المعلمة.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs md:text-sm">
              <div className="space-y-1">
                <div className="text-slate-400">إعداد وتصميم</div>
                <div className="font-bold text-emerald-300">{LESSON_IDENTITY.preparedBy}</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400">أسلوب التدريس التشاركي</div>
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>أ. أسماء قيسي و أ. أسماء صميلي</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Visual */}
          <div className="relative h-56 md:h-64 w-full bg-slate-950 border-t border-slate-800 overflow-hidden">
            {!imgError ? (
              <img
                src={MEDIA_ASSETS.heroNestedLoops}
                alt="تصميم تقني للحلقات المتداخلة في بايثون"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-[#0B162C] to-cyan-950 text-cyan-300 gap-2">
                <Code2 className="w-12 h-12 opacity-80" />
                <span className="text-sm font-bold">مختبر الحلقات المتداخلة — Python</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1525] via-transparent to-transparent" />
            <div className="absolute bottom-4 right-5 left-5 flex items-center justify-between text-xs text-slate-200">
              <span className="font-mono text-cyan-300">for i in range(3): for j in range(2):</span>
              <button
                type="button"
                onClick={onBrowseLessonPlan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold transition cursor-pointer"
              >
                <span>استعراض خطة الدرس التربوية</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Left Column (RTL): Student & Teacher Login Window */}
        <div className="lg:col-span-5 bg-[#0E1525] border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">بوابة الدخول التفاعلية</h2>
              <p className="text-xs text-slate-400 mt-1">
                اختاري صفة الدخول للمشاركة في الحصة أو متابعة النتائج لحظياً
              </p>
            </div>

            {/* Segmented Role Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setRoleTab('student');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                  roleTab === 'student'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>دخول الطالبة</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleTab('teacher');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                  roleTab === 'teacher'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>نافذة المعلمة</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {roleTab === 'student' ? (
              <form onSubmit={handleStudentSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="student-name" className="block text-sm font-semibold text-slate-200">
                    اسم الطالبة
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="اكتبي اسمكِ الثلاثي هنا..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white placeholder-slate-500 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="student-class" className="block text-sm font-semibold text-slate-200">
                    اختاري الفصل الدراسي
                  </label>
                  <select
                    id="student-class"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value as ClassSection)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white text-sm font-semibold cursor-pointer"
                  >
                    {CLASS_SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick class visual buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {CLASS_SECTIONS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setStudentClass(sec)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        studentClass === sec
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'جاري تسجيل الدخول...' : 'ابدئي رحلة التعلم التفاعلية'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleTeacherSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="teacher-name" className="block text-sm font-semibold text-slate-200">
                    اسم المعلمة
                  </label>
                  <input
                    id="teacher-name"
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="مثال: أ. أسماء قيسي"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white placeholder-slate-500 text-sm"
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {LESSON_IDENTITY.coTeachers.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setTeacherName(name)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          teacherName === name
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="teacher-class" className="block text-sm font-semibold text-slate-200">
                    اختاري الفصل لمتابعة التفاعل
                  </label>
                  <select
                    id="teacher-class"
                    value={teacherClass}
                    onChange={(e) => setTeacherClass(e.target.value as TeacherClassFilter)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white text-sm font-semibold cursor-pointer"
                  >
                    <option value="الكل">جميع الفصول (2م / أ · 2م / ب · 2م / ج)</option>
                    {CLASS_SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>الدخول إلى صفحة المعلمة</span>
                </button>
              </form>
            )}
          </div>

          <div className="pt-5 mt-6 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>تظهر نتائج الطالبات فورياً للمعلمة</span>
            <span className="font-mono text-cyan-400">Live Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
