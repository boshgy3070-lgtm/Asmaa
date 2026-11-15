import React, { useMemo, useState } from 'react';
import { Header, NavTab } from './components/Header';
import { LoginPortal } from './components/LoginPortal';
import { VideoIntro } from './components/VideoIntro';
import { LearningStations } from './components/LearningStations';
import { FaithAndNation } from './components/FaithAndNation';
import { FormativeAssessments } from './components/FormativeAssessments';
import { PerformanceTask } from './components/PerformanceTask';
import { SummativeQuiz } from './components/SummativeQuiz';
import { ReflectionAndClosure } from './components/ReflectionAndClosure';
import { LessonPlanView } from './components/LessonPlanView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { useClassroomSync } from './hooks/useClassroomSync';
import { LESSON_IDENTITY } from './data/lessonData';
import { ClassSection, TeacherClassFilter } from './types/lesson';

type AppMode = 'portal' | 'student' | 'teacher' | 'lesson-plan';

export default function App() {
  const {
    state: classroomState,
    connected,
    joinStudent,
    updateStudent,
    awardBadge,
    submitRubricEvaluation,
    rateLesson,
    recordRandomPick,
    resetClassData,
  } = useClassroomSync();

  const [mode, setMode] = useState<AppMode>('portal');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [studentTab, setStudentTab] = useState<string>('video');
  const [teacherInfo, setTeacherInfo] = useState<{
    name: string;
    classFilter: TeacherClassFilter;
  }>({ name: 'أ. أسماء قيسي', classFilter: '2م / أ' });
  const [teacherTab, setTeacherTab] = useState<string>('dashboard');

  const activeStudent = activeStudentId ? classroomState.students[activeStudentId] : null;

  const classmates = useMemo(() => {
    if (!activeStudent) return [];
    return Object.values(classroomState.students).filter(
      (s) => s.classRoom === activeStudent.classRoom && s.id !== activeStudent.id
    );
  }, [classroomState.students, activeStudent]);

  const handleStudentLogin = async (name: string, classRoom: ClassSection) => {
    const record = await joinStudent(name, classRoom);
    setActiveStudentId(record.id);
    setMode('student');
    setStudentTab('video');
  };

  const handleTeacherLogin = (name: string, classFilter: TeacherClassFilter) => {
    setTeacherInfo({ name, classFilter });
    setMode('teacher');
    setTeacherTab('dashboard');
  };

  const studentNavTabs: NavTab[] = [
    { id: 'video', label: 'المقدمة' },
    { id: 'stations', label: 'محطات التعلم' },
    { id: 'faith', label: 'الدين والوطن' },
    { id: 'formative', label: 'التكويني' },
    { id: 'task', label: 'المهمة الأدائية' },
    { id: 'summative', label: 'الختامي' },
    { id: 'closure', label: 'التأمل والخروج' },
  ];

  const teacherNavTabs: NavTab[] = [
    { id: 'dashboard', label: 'نتائج الطالبات' },
    { id: 'plan', label: 'خطة الدرس التربوية' },
    { id: 'stations-preview', label: 'محطات التعلم' },
    { id: 'video-preview', label: 'عرض الفيديو' },
  ];

  const portalNavTabs: NavTab[] = [
    { id: 'portal', label: 'بوابة الدخول' },
    { id: 'lesson-plan', label: 'خطة الدرس التربوية' },
  ];

  const headerProps = (() => {
    if (mode === 'student' && activeStudent) {
      return {
        activeTab: studentTab,
        onSelectTab: setStudentTab,
        navTabs: studentNavTabs,
        userLabel: `${activeStudent.name} (${activeStudent.classRoom}) · تبديل`,
        onSwitchUser: () => setMode('portal'),
      };
    }
    if (mode === 'teacher') {
      return {
        activeTab: teacherTab,
        onSelectTab: setTeacherTab,
        navTabs: teacherNavTabs,
        userLabel: `${teacherInfo.name} · خروج`,
        onSwitchUser: () => setMode('portal'),
        onPrint: () => window.print(),
      };
    }
    return {
      activeTab: mode === 'lesson-plan' ? 'lesson-plan' : 'portal',
      onSelectTab: (tab: string) => setMode(tab === 'lesson-plan' ? 'lesson-plan' : 'portal'),
      navTabs: portalNavTabs,
      userLabel: mode === 'lesson-plan' ? 'العودة للدخول' : 'خطة الدرس',
      onSwitchUser: () => setMode(mode === 'lesson-plan' ? 'portal' : 'lesson-plan'),
    };
  })();

  return (
    <div className="min-h-screen tech-canvas-bg text-slate-100 flex flex-col" dir="rtl">
      <Header mode={mode} {...headerProps} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8">
        {mode === 'portal' && (
          <LoginPortal
            onStudentLogin={handleStudentLogin}
            onTeacherLogin={handleTeacherLogin}
            onBrowseLessonPlan={() => setMode('lesson-plan')}
          />
        )}

        {mode === 'lesson-plan' && <LessonPlanView />}

        {mode === 'student' && activeStudent && (
          <div className="space-y-6">
            {/* Student Welcome & Live Badges Strip */}
            <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-extrabold text-white">أهلاً بكِ، {activeStudent.name}</span>
                <span className="text-slate-500">·</span>
                <span className="text-cyan-300 font-bold">{activeStudent.classRoom}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 text-xs tabular-nums">
                  المحطات المكتملة: {activeStudent.stationsCompleted.length} / 4
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeStudent.teacherBadges.length > 0 ? (
                  activeStudent.teacherBadges.slice(-5).map((b) => (
                    <span
                      key={b.id}
                      className="px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-xs text-amber-200 font-semibold"
                    >
                      {b.emoji} {b.label}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">
                    شاركي في المحطات لتحصلي على أوسمة وفيسات من معلمتكِ
                  </span>
                )}
              </div>
            </div>

            {studentTab === 'video' && (
              <VideoIntro
                completedCheckpoints={activeStudent.videoCheckpoints}
                onSaveCheckpoint={(timeSec, isCorrect, totalCorrect) => {
                  updateStudent(activeStudent.id, {
                    videoCheckpoints: { [timeSec]: isCorrect },
                    videoScore: totalCorrect,
                  });
                }}
                onCompleteVideo={() => {
                  updateStudent(activeStudent.id, { videoCompleted: true });
                }}
              />
            )}

            {studentTab === 'stations' && (
              <LearningStations
                completedStations={activeStudent.stationsCompleted}
                onCompleteStation={(stationId) => {
                  updateStudent(activeStudent.id, { stationsCompleted: [stationId] });
                }}
              />
            )}

            {studentTab === 'faith' && (
              <FaithAndNation
                savedReflection={activeStudent.faithNationReflection}
                onSaveReflection={(text) => {
                  updateStudent(activeStudent.id, { faithNationReflection: text });
                }}
              />
            )}

            {studentTab === 'formative' && (
              <FormativeAssessments
                savedAnswers={activeStudent.formativeAnswers}
                onAnswerSubmit={(questionId, answer, isCorrect) => {
                  updateStudent(activeStudent.id, {
                    formativeAnswers: {
                      [questionId]: { answer, isCorrect, score: isCorrect ? 1 : 0 },
                    },
                  });
                }}
              />
            )}

            {studentTab === 'task' && (
              <PerformanceTask
                savedTask={activeStudent.performanceTask}
                onSubmitTask={(task) => {
                  updateStudent(activeStudent.id, { performanceTask: task });
                }}
              />
            )}

            {studentTab === 'summative' && (
              <SummativeQuiz
                studentName={activeStudent.name}
                studentClass={activeStudent.classRoom}
                savedScore={activeStudent.summativeScore}
                savedAnswers={activeStudent.summativeAnswers}
                onSubmitQuiz={(score, total, answers) => {
                  updateStudent(activeStudent.id, {
                    summativeScore: score,
                    summativeTotal: total,
                    summativeAnswers: answers,
                  });
                }}
              />
            )}

            {studentTab === 'closure' && (
              <ReflectionAndClosure
                student={activeStudent}
                classmates={classmates}
                onSaveSelfAssessment={(ratings, note) => {
                  updateStudent(activeStudent.id, {
                    selfAssessment: { ratings, note, submittedAt: Date.now() },
                  });
                }}
                onSavePeerAssessment={(peerName, ratings, praise) => {
                  updateStudent(activeStudent.id, {
                    peerAssessment: { peerName, ratings, praise, submittedAt: Date.now() },
                  });
                }}
                onSaveTwoStarsWish={(star1, star2, wish) => {
                  updateStudent(activeStudent.id, {
                    twoStarsAndWish: { star1, star2, wish, submittedAt: Date.now() },
                  });
                }}
                onSaveExitTicket={(learned, realLifeLink, moodEmoji, moodLabel) => {
                  updateStudent(activeStudent.id, {
                    exitTicket: {
                      learned,
                      realLifeLink,
                      moodEmoji,
                      moodLabel,
                      submittedAt: Date.now(),
                    },
                  });
                }}
              />
            )}
          </div>
        )}

        {mode === 'teacher' && (
          <div className="space-y-6">
            {teacherTab === 'dashboard' && (
              <TeacherDashboard
                teacherName={teacherInfo.name}
                initialClassFilter={teacherInfo.classFilter}
                classroomState={classroomState}
                connected={connected}
                onAwardBadge={awardBadge}
                onSubmitRubric={submitRubricEvaluation}
                onRateLesson={rateLesson}
                onRandomPick={(st, pickedBy) =>
                  recordRandomPick(st.id, st.name, st.classRoom, pickedBy)
                }
                onResetClass={resetClassData}
              />
            )}

            {teacherTab === 'plan' && <LessonPlanView />}

            {teacherTab === 'stations-preview' && (
              <LearningStations completedStations={[]} onCompleteStation={() => {}} />
            )}

            {teacherTab === 'video-preview' && <VideoIntro />}
          </div>
        )}
      </main>

      <footer className="bg-[#070B14]/90 border-t border-slate-800/80 py-6 text-xs text-slate-400 no-print mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
          <div className="space-y-1">
            <div className="font-bold text-slate-200">{LESSON_IDENTITY.preparedBy}</div>
            <div>
              أسلوب التدريس التشاركي بين المعلمتين: أسماء قيسي و أسماء صميلي · {LESSON_IDENTITY.pages}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMode('lesson-plan')}
              className="hover:text-cyan-300 transition cursor-pointer"
            >
              خطة الدرس التربوية
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setMode('portal')}
              className="hover:text-cyan-300 transition cursor-pointer"
            >
              بوابة الدخول
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
