import React, { useEffect, useState } from 'react';
import { nestedLoopRules } from '../data/lessonData';
import { MEDIA_ASSETS } from '../utils/mediaAssets';
import { runNestedLoopPython } from '../utils/pythonRunner';
import {
  CheckCircle2,
  Play,
  SkipForward,
  RotateCcw,
  Terminal,
  Clock,
  Layers,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface LearningStationsProps {
  completedStations: string[];
  onCompleteStation: (stationId: string) => void;
}

const TRACE_STEPS = [
  { i: 0, j: 0, outerStep: 1 },
  { i: 0, j: 1, outerStep: 1 },
  { i: 1, j: 0, outerStep: 2 },
  { i: 1, j: 1, outerStep: 2 },
  { i: 2, j: 0, outerStep: 3 },
  { i: 2, j: 1, outerStep: 3 },
];

const PATTERN_PRESETS = [
  {
    id: 'p1',
    title: 'نمط الأرقام المتكررة (ص ١٥٨)',
    code: `for num in range(1, 6):\n    for j in range(num):\n        print(num, end=" ")\n    print()`,
  },
  {
    id: 'p2',
    title: 'نمط التسلسل التصاعدي (ص ١٥٨)',
    code: `for num in range(1, 6):\n    for j in range(1, num + 1):\n        print(j, end=" ")\n    print()`,
  },
  {
    id: 'p3',
    title: 'جرب بنفسك ١: التنازلي (ص ١٥٨)',
    code: `for num in range(8, -1, -1):\n    for j in range(0, num):\n        print(num, end=" ")\n    print()`,
  },
  {
    id: 'p4',
    title: 'هرم النجوم (ص ١٥٩)',
    code: `for i in range(0, 5):\n    for j in range(0, i + 1):\n        print("*", end=" ")\n    print()`,
  },
  {
    id: 'p5',
    title: 'جرب بنفسك ٢: نجوم متناقصة (ص ١٥٩)',
    code: `for i in range(6, 0, -1):\n    for j in range(0, i - 1):\n        print("*", end=" ")\n    print()`,
  },
];

export const LearningStations: React.FC<LearningStationsProps> = ({
  completedStations,
  onCompleteStation,
}) => {
  const [activeStation, setActiveStation] = useState<'s1' | 's2' | 's3' | 's4'>('s1');

  // Station 1 state: Step-by-step debugger
  const [traceIdx, setTraceIdx] = useState<number>(0);

  // Station 2 state: Indentation toggle (page 154 vs page 155)
  const [indentMode, setIndentMode] = useState<'outside' | 'inside'>('outside');

  // Station 3 state: Digital Clock simulator & Grade calculator
  const [clockRunning, setClockRunning] = useState(false);
  const [clockSeconds, setClockSeconds] = useState(0); // 0 to 86399
  const [gradesInput, setGradesInput] = useState<[number, number, number]>([75, 80, 90]);
  const [clockImgError, setClockImgError] = useState(false);

  // Station 4 state: Python pattern lab
  const [labCode, setLabCode] = useState(PATTERN_PRESETS[0].code);
  const [labResult, setLabResult] = useState(() => runNestedLoopPython(PATTERN_PRESETS[0].code));

  useEffect(() => {
    if (!clockRunning) return;
    const t = window.setInterval(() => {
      setClockSeconds((prev) => (prev + 1) % 86400);
    }, 120);
    return () => clearInterval(t);
  }, [clockRunning]);

  const hours = Math.floor(clockSeconds / 3600);
  const minutes = Math.floor((clockSeconds % 3600) / 60);
  const seconds = clockSeconds % 60;

  const avgGrade = ((gradesInput[0] + gradesInput[1] + gradesInput[2]) / 3).toFixed(2);

  const indentCodeOutside = `a = 4\nwhile a <= 12:\n    for i in range(3):\n        print("a=", a, "i=", i)\n    a = a + 3`;
  const indentCodeInside = `a = 4\nwhile a <= 12:\n    for i in range(3):\n        print("a=", a, "i=", i)\n        a = a + 3`;
  const indentOutput = runNestedLoopPython(
    indentMode === 'outside' ? indentCodeOutside : indentCodeInside
  );

  const stations = [
    { id: 's1' as const, title: 'المحطة ١: تتبع القيم (i, j)', page: 'ص ١٥٣' },
    { id: 's2' as const, title: 'المحطة ٢: المسافة البادئة والمخطط', page: 'ص ١٥٤-١٥٥' },
    { id: 's3' as const, title: 'المحطة ٣: القواعد والساعة والدرجات', page: 'ص ١٥٦-١٥٧' },
    { id: 's4' as const, title: 'المحطة ٤: أنماط الطباعة والنجوم', page: 'ص ١٥٨-١٥٩' },
  ];

  const isStationDone = (id: string) => completedStations.includes(id);

  return (
    <div className="space-y-6">
      {/* Station Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stations.map((st) => {
          const active = activeStation === st.id;
          const done = isStationDone(st.id);
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setActiveStation(st.id)}
              className={`p-4 rounded-xl border text-right transition cursor-pointer flex items-center justify-between gap-2 ${
                active
                  ? 'bg-cyan-500/15 border-cyan-400 text-white'
                  : 'bg-[#0E1525] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs text-slate-400 mb-1">{st.page}</div>
                <div className="font-bold text-sm">{st.title}</div>
              </div>
              {done && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Station 1: Trace (i, j) */}
      {activeStation === 's1' && (
        <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                المحطة ١: مفهوم التداخل وتتبع القيم (ص ١٥٣)
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                الحلقة المتداخلة تعني جملة حلقة داخل جملة حلقة أخرى. اضغطي «خطوة تالية» لتتبع قيمة i و j لحظة بلحظة.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCompleteStation('s1')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isStationDone('s1')
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isStationDone('s1') ? 'تم إتمام المحطة ١' : 'تأكيد إتمام المحطة ١'}</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Code + Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#020617] border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-sm">
                <div className="text-amber-300">
                  for i in range(3): <span className="text-slate-500 text-xs"># الحلقة الخارجية (٣ مرات)</span>
                </div>
                <div className="pl-6 text-cyan-300">
                  for j in range(2): <span className="text-slate-500 text-xs"># الحلقة الداخلية (مرتان)</span>
                </div>
                <div className="pl-12 text-emerald-300">print("i= ", i, "j= ", j)</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTraceIdx((prev) => (prev + 1) % TRACE_STEPS.length)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>خطوة تالية ({traceIdx + 1} / {TRACE_STEPS.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTraceIdx(0)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-300 space-y-1">
                <div>
                  الخطوة الحالية:{' '}
                  <span className="font-mono font-bold text-amber-300">i = {TRACE_STEPS[traceIdx].i}</span>
                  {' ← '}
                  <span className="font-mono font-bold text-cyan-300">j = {TRACE_STEPS[traceIdx].j}</span>
                </div>
                <div className="text-xs text-slate-400">
                  في النهاية تتكرر الحلقة الخارجية ٣ مرات والحلقة الداخلية ٦ مرات.
                </div>
              </div>
            </div>

            {/* Trace Table (Page 153 exact table) */}
            <div className="lg:col-span-4">
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-center text-sm tabular-nums">
                  <thead className="bg-slate-900 text-cyan-300">
                    <tr>
                      <th className="py-2.5 px-3 border-b border-slate-800">التكرار</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 font-mono">i</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 font-mono">j</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRACE_STEPS.map((step, idx) => {
                      const active = idx === traceIdx;
                      const passed = idx < traceIdx;
                      return (
                        <tr
                          key={idx}
                          onClick={() => setTraceIdx(idx)}
                          className={`cursor-pointer transition ${
                            active
                              ? 'bg-cyan-500/20 text-white font-bold'
                              : passed
                              ? 'bg-slate-900/50 text-slate-300'
                              : 'bg-slate-950/40 text-slate-500'
                          }`}
                        >
                          <td className="py-2 px-3 border-b border-slate-800/70">#{idx + 1}</td>
                          <td className="py-2 px-3 border-b border-slate-800/70 font-mono">{step.i}</td>
                          <td className="py-2 px-3 border-b border-slate-800/70 font-mono">{step.j}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simulated Output Screen */}
            <div className="lg:col-span-3 bg-[#020617] border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 pb-2 mb-3 border-b border-slate-800 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>المخرجات حتى الخطوة</span>
              </div>
              <div className="font-mono text-xs md:text-sm space-y-1.5 text-emerald-300 tabular-nums">
                {TRACE_STEPS.slice(0, traceIdx + 1).map((step, idx) => (
                  <div
                    key={idx}
                    className={idx === traceIdx ? 'text-cyan-300 font-bold' : 'text-emerald-400/80'}
                  >
                    i= {step.i} j= {step.j}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Station 2: Indentation & Flowchart */}
      {activeStation === 's2' && (
        <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                المحطة ٢: أهمية المسافة البادئة والمخطط الانسيابي (ص ١٥٤–١٥٥)
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                جرّبي تحريك السطر <code className="text-amber-300">a = a + 3</code> ولاحظي كيف يتغير المخطط والنتيجة من ٩ أسطر إلى ٣ أسطر!
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCompleteStation('s2')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isStationDone('s2')
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isStationDone('s2') ? 'تم إتمام المحطة ٢' : 'تأكيد إتمام المحطة ٢'}</span>
            </button>
          </div>

          {/* Toggle Mode */}
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIndentMode('outside')}
              className={`p-4 rounded-xl border text-right transition cursor-pointer ${
                indentMode === 'outside'
                  ? 'bg-cyan-500/15 border-cyan-400 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-sm">الحالة الأولى (ص ١٥٤): a = a + 3 خارج الحلقة الداخلية</div>
              <div className="text-xs text-slate-400 mt-1">
                تتغير a بعد انتهاء حلقة for بالكامل ← تطبع ٩ أسطر.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIndentMode('inside')}
              className={`p-4 rounded-xl border text-right transition cursor-pointer ${
                indentMode === 'inside'
                  ? 'bg-amber-500/15 border-amber-400 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-sm">الحالة الثانية (ص ١٥٥): a = a + 3 داخل الحلقة الداخلية</div>
              <div className="text-xs text-slate-400 mt-1">
                تزيد a مع كل دورة للحلقة الداخلية ← تطبع ٣ أسطر فقط.
              </div>
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Highlighted Code */}
            <div className="lg:col-span-5 bg-[#020617] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs text-slate-400 font-semibold">المقطع البرمجي في بايثون</div>
              <pre className="font-mono text-sm leading-relaxed text-slate-200 overflow-x-auto">
                {indentMode === 'outside' ? indentCodeOutside : indentCodeInside}
              </pre>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-200">
                {indentMode === 'outside'
                  ? 'لاحظي محاذاة a = a + 3 تحت كلمة for (مسافة بادئة ٤ مسافات): تتبع حلقة while الخارجية.'
                  : 'لاحظي محاذاة a = a + 3 تحت كلمة print (مسافة بادئة ٨ مسافات): تتبع حلقة for الداخلية.'}
              </div>
            </div>

            {/* Simplified Interactive Flowchart */}
            <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-2.5 text-center text-xs font-bold">
              <div className="text-slate-400 mb-2">المخطط الانسيابي للمقطع البرمجي</div>
              <div className="mx-auto w-28 py-1.5 rounded-full bg-slate-800 text-slate-200">البداية (a = 4)</div>
              <div className="text-slate-500">↓</div>
              <div className="mx-auto w-36 py-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-200 font-mono">
                هل a &lt;= 12 ؟
              </div>
              <div className="text-slate-500">↓ صواب</div>
              <div className="mx-auto w-32 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-mono">i = 0</div>
              <div className="text-slate-500">↓</div>
              <div className="mx-auto w-36 py-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-200 font-mono">
                هل i &lt; 3 ؟
              </div>
              <div className="text-slate-500">↓ صواب</div>
              <div className="mx-auto w-48 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 font-mono">
                print("a=", a, "i=", i)
              </div>
              {indentMode === 'inside' && (
                <>
                  <div className="text-amber-400">↓ (داخل التكرار الداخلي)</div>
                  <div className="mx-auto w-36 py-2 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 font-mono">
                    a = a + 3
                  </div>
                </>
              )}
              <div className="text-slate-500">↓</div>
              <div className="mx-auto w-32 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-mono">i = i + 1</div>
              {indentMode === 'outside' && (
                <>
                  <div className="text-cyan-400">↓ عند انتهاء i &lt; 3 (خطأ)</div>
                  <div className="mx-auto w-36 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-mono">
                    a = a + 3
                  </div>
                </>
              )}
            </div>

            {/* Live Output */}
            <div className="lg:col-span-3 bg-[#020617] border border-slate-800 rounded-xl p-5">
              <div className="text-xs text-slate-400 pb-2 mb-3 border-b border-slate-800">
                النتيجة الفعلية ({indentOutput.linesCount} أسطر)
              </div>
              <pre className="font-mono text-sm text-emerald-300 leading-relaxed tabular-nums">
                {indentOutput.output}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Station 3: Four Rules, Digital Clock & Grades */}
      {activeStation === 's3' && (
        <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                المحطة ٣: القواعد الأربع والساعة الرقمية وحساب الدرجات (ص ١٥٦–١٥٧)
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                اكتشفي القواعد الحاكمة للحلقات المتداخلة وجربي محاكاة الساعة الرقمية وحساب متوسط الدرجات.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCompleteStation('s3')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isStationDone('s3')
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isStationDone('s3') ? 'تم إتمام المحطة ٣' : 'تأكيد إتمام المحطة ٣'}</span>
            </button>
          </div>

          {/* 4 Rules Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {nestedLoopRules.map((rule) => (
              <div key={rule.number} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="font-mono text-xs font-bold text-cyan-400">القاعدة {rule.number}</div>
                <div className="font-bold text-sm text-white">{rule.title}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{rule.text}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Digital Clock 3-Loop Simulator */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>محاكي الساعة الرقمية (٣ حلقات متداخلة)</span>
                </h3>
                <span className="font-mono text-xs text-slate-400">24 × 60 × 60</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 items-center">
                <div className="rounded-xl overflow-hidden border border-slate-800 h-36 bg-slate-900">
                  {!clockImgError ? (
                    <img
                      src={MEDIA_ASSETS.digitalClock}
                      alt="نموذج الساعة الرقمية ثلاثي الحلقات"
                      referrerPolicy="no-referrer"
                      onError={() => setClockImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cyan-300">
                      <Clock className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-center">
                  <div className="p-3 rounded-xl bg-[#020617] border border-cyan-500/30 font-mono text-2xl font-extrabold text-cyan-300 tabular-nums">
                    {String(hours).padStart(2, '0')} : {String(minutes).padStart(2, '0')} : {String(seconds).padStart(2, '0')}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setClockRunning((r) => !r)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      {clockRunning ? 'إيقاف' : 'تشغيل سريع'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setClockSeconds((s) => (s + 58) % 86400)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      +٥٨ ثانية
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClockRunning(false);
                        setClockSeconds(0);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                    >
                      تصفير
                    </button>
                  </div>
                </div>
              </div>

              <pre className="font-mono text-xs bg-[#020617] border border-slate-800 rounded-xl p-3 text-emerald-300 overflow-x-auto">
{`for hour in range(24):
    for min in range(60):
        for sec in range(60):
            print(hour, ":", min, ":", sec)`}
              </pre>
            </div>

            {/* Student Grades Calculator (Page 157) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>مثال حساب درجات الطلبة (ص ١٥٧)</span>
                </h3>
                <span className="text-xs text-slate-400">حلقة خارجية للطلبة + داخلية لـ ٣ درجات</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-xs text-slate-400 block">الدرجة {idx + 1}</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradesInput[idx]}
                      onChange={(e) => {
                        const next: [number, number, number] = [...gradesInput] as [number, number, number];
                        next[idx] = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                        setGradesInput(next);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm tabular-nums"
                    />
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-sm">
                <span className="text-slate-200">الدرجة النهائية للطالبة (المتوسط):</span>
                <span className="font-mono font-extrabold text-emerald-300 text-lg tabular-nums">
                  {avgGrade}
                </span>
              </div>

              <pre className="font-mono text-xs bg-[#020617] border border-slate-800 rounded-xl p-3 text-cyan-300 overflow-x-auto">
{`for student in range(30):
    sumGrades = 0
    for gr in range(1, 4):
        grade = int(input())
        sumGrades = sumGrades + grade
    finalGrade = sumGrades / 3`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Station 4: Printing Patterns & Try It Yourself (Pages 158-159) */}
      {activeStation === 's4' && (
        <div className="bg-[#0E1525] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                المحطة ٤: مختبر أنماط الطباعة والنجوم (ص ١٥٨–١٥٩)
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                الحلقة الخارجية تحدد عدد الصفوف، والداخلية تحدد عدد الأعمدة. اختاري نموذجاً أو عدّلي الكود وشغليه مباشرة!
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCompleteStation('s4')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isStationDone('s4')
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isStationDone('s4') ? 'تم إتمام المحطة ٤' : 'تأكيد إتمام المحطة ٤'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PATTERN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setLabCode(preset.code);
                  setLabResult(runNestedLoopPython(preset.code));
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  labCode === preset.code
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>محرر بايثون التفاعلي</span>
                <span className="font-mono">end=" " يمنع الانتقال لسطر جديد</span>
              </div>
              <textarea
                value={labCode}
                onChange={(e) => setLabCode(e.target.value)}
                rows={9}
                spellCheck={false}
                className="w-full p-4 rounded-xl bg-[#020617] border border-slate-700 focus:border-cyan-400 focus:outline-none font-mono text-sm text-cyan-200 leading-relaxed"
              />
              <button
                type="button"
                onClick={() => setLabResult(runNestedLoopPython(labCode))}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm transition cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>تشغيل المقطع البرمجي</span>
              </button>
            </div>

            <div className="lg:col-span-5 bg-[#020617] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-400 pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>شاشة المخرجات</span>
                  </span>
                  <span className="font-mono text-slate-500">{labResult.linesCount} صفوف</span>
                </div>

                {labResult.success ? (
                  <pre className="font-mono text-sm md:text-base text-emerald-300 leading-relaxed whitespace-pre-wrap">
                    {labResult.output || '(لا توجد مخرجات)'}
                  </pre>
                ) : (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-700/50 text-rose-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{labResult.error}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>جرّبي تغيير الأرقام داخل range() وشاهدي كيف يتغير شكل الهرم فوراً.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
