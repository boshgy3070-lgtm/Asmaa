import React from 'react';
import {
  bloomObjectives,
  coTeachingPhases,
  LESSON_IDENTITY,
  pedagogicalKnowledgePillars,
} from '../data/lessonData';
import { Users, Clock, BookOpen, CheckCircle2, Layers } from 'lucide-react';

export const LessonPlanView: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Official Lesson Header Card */}
      <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 print-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-2">
            <div className="text-xs font-bold text-cyan-300">
              {LESSON_IDENTITY.school} · {LESSON_IDENTITY.subject} · {LESSON_IDENTITY.grade}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white [text-wrap:balance]">
              {LESSON_IDENTITY.title}
            </h2>
            <p className="text-sm text-emerald-300 font-bold">{LESSON_IDENTITY.preparedBy}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <Users className="w-4 h-4" />
              <span>أسلوب التدريس التشاركي: أ. أسماء قيسي و أ. أسماء صميلي</span>
            </div>
            <div className="flex items-center gap-2 tabular-nums">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>الزمن: {LESSON_IDENTITY.durationMinutes} دقيقة · {LESSON_IDENTITY.pages}</span>
            </div>
          </div>
        </div>

        {/* Bloom Objectives */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>الأهداف السلوكية وفق تصنيف بلوم المعدّل</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {bloomObjectives.map((obj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="text-xs font-extrabold text-cyan-300">المستوى: {obj.level}</div>
                <p className="text-sm font-semibold text-white leading-relaxed">{obj.text}</p>
                <div className="text-xs text-slate-400">أداة القياس: {obj.measurement}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrated Pedagogical Knowledge */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span>المعرفة التربوية المتكاملة: إدارة الصف والتفاعل واستراتيجيات التدريس</span>
        </h3>
        <div className="grid lg:grid-cols-3 gap-6">
          {pedagogicalKnowledgePillars.map((pillar) => (
            <div key={pillar.id} className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-4 print-card">
              <div>
                <h4 className="text-base font-extrabold text-white">{pillar.title}</h4>
                <p className="text-xs text-cyan-300 mt-0.5">{pillar.subtitle}</p>
              </div>
              <ul className="space-y-2.5 text-xs md:text-sm text-slate-300 leading-relaxed">
                {pillar.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Co-Teaching Execution Matrix */}
      <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5 print-card">
        <div>
          <h3 className="text-xl font-extrabold text-white">
            مصفوفة تنفيذ الدرس بالتدريس التشاركي (Co-Teaching)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            توزيع الأدوار التكاملي بين المعلمة أسماء قيسي والمعلمة أسماء صميلي خلال مراحل الحصة الـ ٤٥ دقيقة.
          </p>
        </div>

        <div className="space-y-4">
          {coTeachingPhases.map((phase) => (
            <div key={phase.id} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-extrabold text-cyan-300">{phase.title}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    نموذج التدريس التشاركي: {phase.coTeachingModel} · الاستراتيجية: {phase.strategy}
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
                  {phase.timeMinutes} دقائق
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs md:text-sm">
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-emerald-300">دور أ. أسماء قيسي</div>
                  <p className="text-slate-300 leading-relaxed">{phase.asmaQaisiRole}</p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-cyan-300">دور أ. أسماء صميلي</div>
                  <p className="text-slate-300 leading-relaxed">{phase.asmaSamiliRole}</p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-amber-300">دور الطالبة وإدارة الصف</div>
                  <p className="text-slate-300 leading-relaxed">{phase.studentRole}</p>
                  <p className="text-slate-400 text-xs pt-1">{phase.classroomManagement}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                <span>الأدوات: {phase.tools.join(' · ')}</span>
                <span className="text-emerald-300">التقويم: {phase.evaluation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
