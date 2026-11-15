import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '2mb' }));

// Persistent JSON classroom store path
const DATA_DIR = path.resolve('data');
const STATE_FILE = path.join(DATA_DIR, 'classroom-state.json');

export type ClassSection = '2م / أ' | '2م / ب' | '2م / ج';

export interface TeacherBadge {
  id: string;
  emoji: string;
  label: string;
  awardedBy: string;
  timestamp: number;
}

export interface RubricEvaluation {
  understanding: number; // 1-3
  indentation: number;   // 1-3
  problemSolving: number;// 1-3
  collaboration: number; // 1-3
  note: string;
  evaluatedBy: string;
  updatedAt: number;
}

export interface StudentRecord {
  id: string;
  name: string;
  classRoom: ClassSection;
  joinedAt: number;
  lastActive: number;
  videoCompleted: boolean;
  videoScore: number;
  videoCheckpoints: Record<number, boolean>;
  stationsCompleted: string[];
  formativeAnswers: Record<string, { answer: string; isCorrect: boolean; score: number }>;
  faithNationReflection: string;
  performanceTask: {
    challengeId: string;
    challengeTitle: string;
    code: string;
    output: string;
    submittedAt: number;
  } | null;
  summativeScore: number | null;
  summativeTotal: number | null;
  summativeAnswers: Record<number, number>;
  selfAssessment: {
    ratings: Record<string, number>;
    note: string;
    submittedAt: number;
  } | null;
  peerAssessment: {
    peerName: string;
    ratings: Record<string, number>;
    praise: string;
    submittedAt: number;
  } | null;
  twoStarsAndWish: {
    star1: string;
    star2: string;
    wish: string;
    submittedAt: number;
  } | null;
  exitTicket: {
    learned: string;
    realLifeLink: string;
    moodEmoji: string;
    moodLabel: string;
    submittedAt: number;
  } | null;
  teacherBadges: TeacherBadge[];
  rubricEvaluation: RubricEvaluation | null;
}

export interface LessonRatingRecord {
  id: string;
  teacherName: string;
  classRoom: string;
  emoji: string;
  label: string;
  note: string;
  timestamp: number;
}

export interface RandomPickRecord {
  studentId: string;
  studentName: string;
  classRoom: ClassSection;
  pickedBy: string;
  pickedAt: number;
}

export interface ClassroomState {
  students: Record<string, StudentRecord>;
  lessonRatings: LessonRatingRecord[];
  lastRandomPick: RandomPickRecord | null;
}

function createInitialState(): ClassroomState {
  return {
    students: {},
    lessonRatings: [],
    lastRandomPick: null,
  };
}

function loadState(): ClassroomState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        students: parsed.students || {},
        lessonRatings: Array.isArray(parsed.lessonRatings) ? parsed.lessonRatings : [],
        lastRandomPick: parsed.lastRandomPick || null,
      };
    }
  } catch (err) {
    console.error('Failed to load classroom state:', err);
  }
  return createInitialState();
}

function saveState(state: ClassroomState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save classroom state:', err);
  }
}

let classroomState: ClassroomState = loadState();

function makeStudentId(name: string, classRoom: ClassSection): string {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  return `${classRoom}::${cleanName}`;
}

function createBlankStudent(name: string, classRoom: ClassSection): StudentRecord {
  const now = Date.now();
  return {
    id: makeStudentId(name, classRoom),
    name: name.trim().replace(/\s+/g, ' '),
    classRoom,
    joinedAt: now,
    lastActive: now,
    videoCompleted: false,
    videoScore: 0,
    videoCheckpoints: {},
    stationsCompleted: [],
    formativeAnswers: {},
    faithNationReflection: '',
    performanceTask: null,
    summativeScore: null,
    summativeTotal: null,
    summativeAnswers: {},
    selfAssessment: null,
    peerAssessment: null,
    twoStarsAndWish: null,
    exitTicket: null,
    teacherBadges: [],
    rubricEvaluation: null,
  };
}

// Create HTTP server for Express + WebSocket upgrade
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(event: string, payload: unknown) {
  const message = JSON.stringify({ event, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function applyStudentUpdate(studentId: string, patch: Partial<StudentRecord>) {
  const existing = classroomState.students[studentId];
  if (!existing) return null;

  const updated: StudentRecord = {
    ...existing,
    ...patch,
    id: existing.id,
    name: existing.name,
    classRoom: existing.classRoom,
    lastActive: Date.now(),
  };

  // Merge nested maps cleanly so partial updates don't wipe prior answers
  if (patch.stationsCompleted) {
    updated.stationsCompleted = Array.from(
      new Set([...existing.stationsCompleted, ...patch.stationsCompleted])
    );
  }
  if (patch.formativeAnswers) {
    updated.formativeAnswers = {
      ...existing.formativeAnswers,
      ...patch.formativeAnswers,
    };
  }
  if (patch.videoCheckpoints) {
    updated.videoCheckpoints = {
      ...existing.videoCheckpoints,
      ...patch.videoCheckpoints,
    };
  }

  classroomState.students[studentId] = updated;
  saveState(classroomState);
  broadcast('student:updated', updated);
  return updated;
}

wss.on('connection', (ws) => {
  // Initial sync upon connection
  ws.send(JSON.stringify({ event: 'state:init', payload: classroomState }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const { event, payload } = msg || {};

      if (event === 'state:request') {
        ws.send(JSON.stringify({ event: 'state:init', payload: classroomState }));
        return;
      }

      if (event === 'student:join') {
        const { name, classRoom } = payload || {};
        if (!name || !classRoom) return;
        const id = makeStudentId(name, classRoom);
        if (!classroomState.students[id]) {
          classroomState.students[id] = createBlankStudent(name, classRoom);
        } else {
          classroomState.students[id].lastActive = Date.now();
        }
        saveState(classroomState);
        broadcast('student:updated', classroomState.students[id]);
        return;
      }

      if (event === 'student:update') {
        const { studentId, patch } = payload || {};
        if (!studentId || !patch) return;
        applyStudentUpdate(studentId, patch);
        return;
      }

      if (event === 'teacher:award_badge') {
        const { studentId, badge } = payload || {};
        const student = classroomState.students[studentId];
        if (!student || !badge) return;
        const newBadge: TeacherBadge = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          emoji: badge.emoji,
          label: badge.label,
          awardedBy: badge.awardedBy || 'أ. أسماء قيسي',
          timestamp: Date.now(),
        };
        student.teacherBadges = [...student.teacherBadges, newBadge];
        student.lastActive = Date.now();
        saveState(classroomState);
        broadcast('student:updated', student);
        return;
      }

      if (event === 'teacher:rubric_eval') {
        const { studentId, evaluation } = payload || {};
        const student = classroomState.students[studentId];
        if (!student || !evaluation) return;
        student.rubricEvaluation = {
          ...evaluation,
          updatedAt: Date.now(),
        };
        saveState(classroomState);
        broadcast('student:updated', student);
        return;
      }

      if (event === 'teacher:rate_lesson') {
        const rating: LessonRatingRecord = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          teacherName: payload.teacherName || 'أ. أسماء قيسي',
          classRoom: payload.classRoom || 'الكل',
          emoji: payload.emoji,
          label: payload.label,
          note: payload.note || '',
          timestamp: Date.now(),
        };
        classroomState.lessonRatings = [rating, ...classroomState.lessonRatings].slice(0, 50);
        saveState(classroomState);
        broadcast('lesson:rated', rating);
        return;
      }

      if (event === 'teacher:random_pick') {
        const pick: RandomPickRecord = {
          studentId: payload.studentId,
          studentName: payload.studentName,
          classRoom: payload.classRoom,
          pickedBy: payload.pickedBy || 'أ. أسماء قيسي',
          pickedAt: Date.now(),
        };
        classroomState.lastRandomPick = pick;
        saveState(classroomState);
        broadcast('teacher:random_picked', pick);
        return;
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });
});

// REST API endpoints (reliable fallback + initial hydration)
app.get('/api/classroom/state', (_req, res) => {
  res.json(classroomState);
});

app.post('/api/classroom/student/join', (req, res) => {
  const { name, classRoom } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'الرجاء إدخال اسم الطالبة' });
  }
  if (!['2م / أ', '2م / ب', '2م / ج'].includes(classRoom)) {
    return res.status(400).json({ error: 'الرجاء اختيار الفصل الدراسي الصحيح' });
  }
  const id = makeStudentId(name, classRoom as ClassSection);
  if (!classroomState.students[id]) {
    classroomState.students[id] = createBlankStudent(name, classRoom as ClassSection);
  } else {
    classroomState.students[id].lastActive = Date.now();
  }
  saveState(classroomState);
  broadcast('student:updated', classroomState.students[id]);
  return res.json({ student: classroomState.students[id], state: classroomState });
});

app.post('/api/classroom/student/update', (req, res) => {
  const { studentId, patch } = req.body || {};
  if (!studentId || !patch) {
    return res.status(400).json({ error: 'بيانات التحديث غير مكتملة' });
  }
  const updated = applyStudentUpdate(studentId, patch);
  if (!updated) {
    return res.status(404).json({ error: 'الطالبة غير مسجلة' });
  }
  return res.json({ student: updated });
});

app.post('/api/classroom/teacher/badge', (req, res) => {
  const { studentId, emoji, label, awardedBy } = req.body || {};
  const student = classroomState.students[studentId];
  if (!student) return res.status(404).json({ error: 'الطالبة غير موجودة' });
  const newBadge: TeacherBadge = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    emoji: emoji || '⭐',
    label: label || 'متميزة',
    awardedBy: awardedBy || 'أ. أسماء قيسي',
    timestamp: Date.now(),
  };
  student.teacherBadges = [...student.teacherBadges, newBadge];
  saveState(classroomState);
  broadcast('student:updated', student);
  return res.json({ student });
});

app.post('/api/classroom/teacher/rubric', (req, res) => {
  const { studentId, evaluation } = req.body || {};
  const student = classroomState.students[studentId];
  if (!student || !evaluation) return res.status(400).json({ error: 'بيانات غير مكتملة' });
  student.rubricEvaluation = { ...evaluation, updatedAt: Date.now() };
  saveState(classroomState);
  broadcast('student:updated', student);
  return res.json({ student });
});

app.post('/api/classroom/teacher/rate-lesson', (req, res) => {
  const { teacherName, classRoom, emoji, label, note } = req.body || {};
  const rating: LessonRatingRecord = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    teacherName: teacherName || 'أ. أسماء قيسي',
    classRoom: classRoom || 'الكل',
    emoji: emoji || '🤩',
    label: label || 'حصة رائعة',
    note: note || '',
    timestamp: Date.now(),
  };
  classroomState.lessonRatings = [rating, ...classroomState.lessonRatings].slice(0, 50);
  saveState(classroomState);
  broadcast('lesson:rated', rating);
  return res.json({ rating });
});

app.post('/api/classroom/teacher/random-pick', (req, res) => {
  const { studentId, studentName, classRoom, pickedBy } = req.body || {};
  const pick: RandomPickRecord = {
    studentId,
    studentName,
    classRoom,
    pickedBy: pickedBy || 'أ. أسماء قيسي',
    pickedAt: Date.now(),
  };
  classroomState.lastRandomPick = pick;
  saveState(classroomState);
  broadcast('teacher:random_picked', pick);
  return res.json({ pick });
});

app.post('/api/classroom/teacher/reset-class', (req, res) => {
  const { classRoom } = req.body || {};
  if (!classRoom || classRoom === 'الكل') {
    classroomState = createInitialState();
  } else {
    const filtered: Record<string, StudentRecord> = {};
    for (const [id, st] of Object.entries(classroomState.students)) {
      if (st.classRoom !== classRoom) filtered[id] = st;
    }
    classroomState.students = filtered;
  }
  saveState(classroomState);
  broadcast('state:init', classroomState);
  return res.json({ ok: true, state: classroomState });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server + WebSocket running at http://localhost:${port}`);
  });
}

startServer();
