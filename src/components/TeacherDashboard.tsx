import React, { useMemo, useState } from 'react';
import {
  CLASS_SECTIONS,
  LESSON_RATING_OPTIONS,
  rubricCriteria,
  TEACHER_EMOJIS,
} from '../data/lessonData';
import {
  ClassroomState,
  RubricEvaluation,
  StudentRecord,
  TeacherClassFilter,
} from '../types/lesson';
import {
  Shuffle,
  Users,
  Award,
  CheckCircle2,
  Ticket,
  Star,
  ClipboardCheck,
  Trash2,
  Eye,
  X,
} from 'lucide-react';

interface TeacherDashboardProps {
  teacherName: string;
  initialClassFilter: TeacherClassFilter;
  classroomState: ClassroomState;
  connected: boolean;
  onAwardBadge: (studentId: string, emoji: string, label: string, awardedBy: string) => void;
  onSubmitRubric: (studentId: string, evaluation: Omit<RubricEvaluation, 'updatedAt'>) => void;
  onRateLesson: (teacherName: string, classRoom: string, emoji: string, label: string, note: string) => void;
  onRandomPick: (student: StudentRecord, pickedBy: string) => void;
  onResetClass: (classRoom: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacherName,
  initialClassFilter,
  classroomState,
  connected,
  onAwardBadge,
  onSubmitRubric,
  onRateLesson,
  onRandomPick,
  onResetClass,
}) => {
  const [classFilter, setClassFilter] = useState<TeacherClassFilter>(initialClassFilter);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [lessonNote, setLessonNote] = useState('');
  const [selectedRatingIdx, setSelectedRatingIdx] = useState(0);

  // Random picker animation state
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningName, setSpinningName] = useState<string | null>(null);

  // Rubric modal draft
  const [rubricDraft, setRubricDraft] = useState<{
    understanding: number;
    indentation: number;
    problemSolving: number;
    collaboration: number;
    note: string;
  }>({
    understanding: 3,
    indentation: 3,
    problemSolving: 3,
    collaboration: 3,
    note: '',
  });

  const allStudents = useMemo(
    () => Object.values(classroomState.students).sort((a, b) => b.lastActive - a.lastActive),
    [classroomState.students]
  );

  const filteredStudents = useMemo(() => {
    if (classFilter === 'الكل') return allStudents;
    return allStudents.filter((s) => s.classRoom === classFilter);
  }, [allStudents, classFilter]);

  const selectedStudent = selectedStudentId ? classroomState.students[selectedStudentId] : null;

  const stats = useMemo(() => {
    const count = filteredStudents.length;
    const exitCount = filteredStudents.filter((s) => s.exitTicket !== null).length;
    const taskCount = filteredStudents.filter((s) => s.performanceTask !== null).length;
    const summativeList = filteredStudents.filter((s) => s.summativeScore !== null);
    const avgSummative =
      summativeList.length > 0
        ? Math.round(
            (summativeList.reduce(
              (acc, s) => acc + ((s.summativeScore || 0) / (s.summativeTotal || 6)) * 100,
              0
            ) /
              summativeList.length)
          )
        : 0;
    return { count, exitCount, taskCount, avgSummative };
  }, [filteredStudents]);

  const handleRunRandomPick = () => {
    if (filteredStudents.length === 0 || isSpinning) return;
    setIsSpinning(true);
    let ticks = 0;
    const interval = window.setInterval(() => {
      const rnd = filteredStudents[Math.floor(Math.random() * filteredStudents.length)];
      setSpinningName(rnd.name);
      ticks++;
      if (ticks >= 14) {
        window.clearInterval(interval);
        const winner = filteredStudents[Math.floor(Math.random() * filteredStudents.length)];
        setSpinningName(winner.name);
        setIsSpinning(false);
        onRandomPick(winner, teacherName);
      }
    }, 90);
  };

  const openStudentModal = (st: StudentRecord) => {
    setSelectedStudentId(st.id);
    if (st.rubricEvaluation) {
      setRubricDraft({
        understanding: st.rubricEvaluation.understanding,
        indentation: st.rubricEvaluation.indentation,
        problemSolving: st.rubricEvaluation.problemSolving,
        collaboration: st.rubricEvaluation.collaboration,
        note: st.rubricEvaluation.note,
      });
    } else {
      setRubricDraft({
        understanding: 3,
        indentation: 3,
        problemSolving: 3,
        collaboration: 3,
        note: '',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Teacher Control Header + Class Filter */}
      <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
            <span>لوحة متابعة المعلمة · {teacherName}</span>
            <span aria-hidden="true">·</span>
            <span>{connected ? 'متصل لحظياً' : 'جاري المزامنة'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">
            نتائج تفاعل الطالبات وإدارة الحصة
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['الكل', ...CLASS_SECTIONS] as TeacherClassFilter[]).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setClassFilter(sec)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                classFilter === sec
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {sec === 'الكل' ? 'جميع الفصول' : sec}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Live KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400">الطالبات المتفاعلات</div>
          <div className="text-2xl font-extrabold text-white">{stats.count}</div>
        </div>
        <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400">تسليم المهمة الأدائية</div>
          <div className="text-2xl font-extrabold text-cyan-300">{stats.taskCount}</div>
        </div>
        <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400">متوسط التقييم الختامي</div>
          <div className="text-2xl font-extrabold text-emerald-300">{stats.avgSummative}%</div>
        </div>
        <div className="bg-[#0E1525] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400">بطاقات الخروج المستلمة</div>
          <div className="text-2xl font-extrabold text-amber-300">{stats.exitCount}</div>
        </div>
      </div>

      {/* Interactive Tools Row: Random Student Picker + Lesson Emoji Rating */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Random Student Picker */}
        <div className="lg:col-span-5 bg-[#0E1525] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-cyan-400" />
              <span>الاختيار العشوائي للطالبات</span>
            </h3>
            <p className="text-xs text-slate-400">
              قرعة ذكية لاختيار طالبة عشوائياً من طالبات ({classFilter}) للمشاركة الصفية.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
            {isSpinning ? (
              <div className="text-xl font-extrabold text-cyan-300">{spinningName}</div>
            ) : classroomState.lastRandomPick ? (
              <>
                <div className="text-xs text-slate-400">الطالبة المختارة</div>
                <div className="text-2xl font-extrabold text-emerald-300">
                  {classroomState.lastRandomPick.studentName}
                </div>
                <div className="text-xs text-cyan-300">
                  الفصل: {classroomState.lastRandomPick.classRoom}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">
                {filteredStudents.length > 0
                  ? 'اضغطي زر الاختيار العشوائي لبدء القرعة'
                  : 'بانتظار دخول الطالبات في هذا الفصل'}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRunRandomPick}
              disabled={filteredStudents.length === 0 || isSpinning}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>{isSpinning ? 'جاري الاختيار...' : 'اختيار طالبة عشوائياً'}</span>
            </button>

            {classroomState.lastRandomPick && !isSpinning && (
              <button
                type="button"
                onClick={() =>
                  onAwardBadge(
                    classroomState.lastRandomPick!.studentId,
                    '🌟',
                    'بطلة الاختيار العشوائي',
                    teacherName
                  )
                }
                className="py-2.5 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-xs font-bold cursor-pointer"
              >
                + منح نجمة 🌟
              </button>
            )}
          </div>
        </div>

        {/* Lesson Rating by Teacher using Emojis / Icons */}
        <div className="lg:col-span-7 bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-white">تقييم الحصة بالفيسات والأيقونات</h3>
              <p className="text-xs text-slate-400">
                أضيفي تقييماً فورياً لأداء الفصل ({classFilter}) مع فيس تعبيري وملاحظة تربوية.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LESSON_RATING_OPTIONS.map((opt, idx) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelectedRatingIdx(idx)}
                className={`p-2.5 rounded-xl border text-right transition flex items-center gap-2.5 cursor-pointer ${
                  selectedRatingIdx === idx
                    ? 'bg-emerald-500/20 border-emerald-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-xl shrink-0">{opt.emoji}</span>
                <span className="text-xs font-bold leading-snug">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={lessonNote}
              onChange={(e) => setLessonNote(e.target.value)}
              placeholder="ملاحظة تربوية عن الحصة (اختياري)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500"
            />
            <button
              type="button"
              onClick={() => {
                const chosen = LESSON_RATING_OPTIONS[selectedRatingIdx];
                onRateLesson(teacherName, classFilter, chosen.emoji, chosen.label, lessonNote.trim());
                setLessonNote('');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm whitespace-nowrap cursor-pointer"
            >
              إضافة تقييم للحصة
            </button>
          </div>

          {classroomState.lessonRatings.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              {classroomState.lessonRatings.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center gap-2"
                >
                  <span>{r.emoji}</span>
                  <span className="font-bold text-white">{r.label}</span>
                  <span className="text-slate-400">({r.classRoom})</span>
                  {r.note && <span className="text-cyan-300">· {r.note}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Student Results Table */}
      <div className="bg-[#0E1525] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-extrabold text-white">
              سجل تفاعل الطالبات المباشر ({filteredStudents.length})
            </h3>
          </div>
          {filteredStudents.length > 0 && (
            <button
              type="button"
              onClick={() => onResetClass(classFilter)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-xs text-slate-300 hover:text-rose-200 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تصفير سجل {classFilter}</span>
            </button>
          )}
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-base font-bold text-slate-300">لا توجد طالبات مسجلات في ({classFilter}) حتى الآن</div>
            <p className="text-xs text-slate-500">
              بمجرد دخول الطالبة باسمها وفصلها من بوابة الدخول ستظهر جميع إجاباتها ومحطاتها هنا فورياً.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs md:text-sm tabular-nums">
              <thead className="bg-slate-900 text-slate-300">
                <tr>
                  <th className="p-3.5 border-b border-slate-800">الطالبة</th>
                  <th className="p-3.5 border-b border-slate-800">الفصل</th>
                  <th className="p-3.5 border-b border-slate-800">المحطات</th>
                  <th className="p-3.5 border-b border-slate-800">التكويني</th>
                  <th className="p-3.5 border-b border-slate-800">المهمة</th>
                  <th className="p-3.5 border-b border-slate-800">الختامي</th>
                  <th className="p-3.5 border-b border-slate-800">بطاقة الخروج</th>
                  <th className="p-3.5 border-b border-slate-800">منح فيس سريع</th>
                  <th className="p-3.5 border-b border-slate-800">التفاصيل والسلم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudents.map((st) => {
                  const formativeCorrect = Object.values(st.formativeAnswers).filter((a) => a.isCorrect).length;
                  const formativeTotal = Object.keys(st.formativeAnswers).length;
                  return (
                    <tr key={st.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3.5 font-bold text-white">
                        <div>{st.name}</div>
                        {st.teacherBadges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 text-sm">
                            {st.teacherBadges.slice(-4).map((b) => (
                              <span key={b.id} title={`${b.label} (${b.awardedBy})`}>
                                {b.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-cyan-300 font-semibold whitespace-nowrap">{st.classRoom}</td>
                      <td className="p-3.5 text-slate-200">{st.stationsCompleted.length} / 4</td>
                      <td className="p-3.5 text-slate-200">
                        {formativeTotal > 0 ? `${formativeCorrect}/${formativeTotal}` : '—'}
                      </td>
                      <td className="p-3.5">
                        {st.performanceTask ? (
                          <span className="text-emerald-300 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مُسلّمة</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-amber-300">
                        {st.summativeScore !== null ? `${st.summativeScore}/${st.summativeTotal}` : '—'}
                      </td>
                      <td className="p-3.5">
                        {st.exitTicket ? (
                          <span className="inline-flex items-center gap-1 text-emerald-300">
                            <span>{st.exitTicket.moodEmoji}</span>
                            <span className="text-xs">مكتملة</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          {TEACHER_EMOJIS.slice(0, 4).map((em) => (
                            <button
                              key={em.emoji}
                              type="button"
                              title={em.label}
                              onClick={() => onAwardBadge(st.id, em.emoji, em.label, teacherName)}
                              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-sm cursor-pointer transition"
                            >
                              {em.emoji}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => openStudentModal(st)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-bold cursor-pointer whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض وتقييم</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detailed Inspection + Rubric Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs p-4 flex items-center justify-center overflow-y-auto">
          <div className="max-w-3xl w-full bg-[#0E1525] border border-slate-700 rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-cyan-300 font-bold">{selectedStudent.classRoom}</div>
                <h3 className="text-xl font-extrabold text-white">{selectedStudent.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentId(null)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Award All Emojis */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>منح وسام / فيس تشجيعي للطالبة:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TEACHER_EMOJIS.map((em) => (
                  <button
                    key={em.label}
                    type="button"
                    onClick={() => onAwardBadge(selectedStudent.id, em.emoji, em.label, teacherName)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{em.emoji}</span>
                    <span>{em.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Student Work Summary */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              {selectedStudent.performanceTask && (
                <div className="sm:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-300">
                    كود المهمة الأدائية: {selectedStudent.performanceTask.challengeTitle}
                  </div>
                  <pre className="font-mono text-xs text-slate-200 bg-slate-900 p-3 rounded-lg overflow-x-auto">
                    {selectedStudent.performanceTask.code}
                  </pre>
                  <div className="text-emerald-300 font-mono whitespace-pre-wrap">
                    المخرجات: {selectedStudent.performanceTask.output}
                  </div>
                </div>
              )}

              {selectedStudent.faithNationReflection && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-300">تأمل الربط بالدين والوطن والمواد:</div>
                  <p className="text-slate-200 leading-relaxed">{selectedStudent.faithNationReflection}</p>
                </div>
              )}

              {selectedStudent.peerAssessment && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-300">
                    تقييم الأقران (لـ {selectedStudent.peerAssessment.peerName}):
                  </div>
                  <p className="text-slate-200">{selectedStudent.peerAssessment.praise || 'تم التقييم رقمياً'}</p>
                </div>
              )}

              {selectedStudent.twoStarsAndWish && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    <span>نجمتان وأمنية:</span>
                  </div>
                  <div className="text-slate-200">★ {selectedStudent.twoStarsAndWish.star1}</div>
                  <div className="text-slate-200">★ {selectedStudent.twoStarsAndWish.star2}</div>
                  <div className="text-cyan-300">أمنية: {selectedStudent.twoStarsAndWish.wish}</div>
                </div>
              )}

              {selectedStudent.exitTicket && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>بطاقة الخروج ({selectedStudent.exitTicket.moodEmoji} {selectedStudent.exitTicket.moodLabel}):</span>
                  </div>
                  <div className="text-slate-200">التعلم: {selectedStudent.exitTicket.learned}</div>
                  <div className="text-slate-400">الربط: {selectedStudent.exitTicket.realLifeLink}</div>
                </div>
              )}
            </div>

            {/* Teacher Rubric Evaluation Form */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                <span>رصد سلم التقدير للطالبة</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {rubricCriteria.map((crit) => (
                  <div key={crit.id} className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-300">{crit.title}</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[3, 2, 1].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() =>
                            setRubricDraft((prev) => ({ ...prev, [crit.id]: score }))
                          }
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border cursor-pointer ${
                            rubricDraft[crit.id] === score
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {score === 3 ? 'متقنة (٣)' : score === 2 ? 'متقدمة (٢)' : 'تطوير (١)'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <input
                type="text"
                value={rubricDraft.note}
                onChange={(e) => setRubricDraft((p) => ({ ...p, note: e.target.value }))}
                placeholder="تغذية راجعة من المعلمة تظهر للطالبة..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />

              <button
                type="button"
                onClick={() => {
                  onSubmitRubric(selectedStudent.id, {
                    ...rubricDraft,
                    evaluatedBy: teacherName,
                  });
                  setSelectedStudentId(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm cursor-pointer"
              >
                حفظ تقييم سلم التقدير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
