import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ClassroomState,
  ClassSection,
  LessonRatingRecord,
  RandomPickRecord,
  RubricEvaluation,
  StudentRecord,
} from '../types/lesson';

const EMPTY_STATE: ClassroomState = {
  students: {},
  lessonRatings: [],
  lastRandomPick: null,
};

export function useClassroomSync() {
  const [state, setState] = useState<ClassroomState>(EMPTY_STATE);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const fetchInitialState = useCallback(async () => {
    try {
      const res = await fetch('/api/classroom/state');
      if (res.ok) {
        const data: ClassroomState = await res.json();
        setState(data);
      }
    } catch {
      // Ignore network hiccup, WS will sync
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialState();

    let isUnmounted = false;
    function connectWs() {
      if (isUnmounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isUnmounted) {
          setConnected(true);
          ws.send(JSON.stringify({ event: 'state:request' }));
        }
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.event === 'state:init') {
            setState(msg.payload);
            setLoading(false);
          } else if (msg.event === 'student:updated') {
            const student: StudentRecord = msg.payload;
            setState((prev) => ({
              ...prev,
              students: {
                ...prev.students,
                [student.id]: student,
              },
            }));
          } else if (msg.event === 'lesson:rated') {
            const rating: LessonRatingRecord = msg.payload;
            setState((prev) => {
              if (prev.lessonRatings.some((r) => r.id === rating.id)) return prev;
              return {
                ...prev,
                lessonRatings: [rating, ...prev.lessonRatings].slice(0, 50),
              };
            });
          } else if (msg.event === 'teacher:random_picked') {
            const pick: RandomPickRecord = msg.payload;
            setState((prev) => ({
              ...prev,
              lastRandomPick: pick,
            }));
          }
        } catch {
          // Ignore malformed message
        }
      };

      ws.onclose = () => {
        if (!isUnmounted) {
          setConnected(false);
          reconnectTimeoutRef.current = window.setTimeout(connectWs, 2500);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connectWs();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchInitialState]);

  const joinStudent = useCallback(async (name: string, classRoom: ClassSection) => {
    const res = await fetch('/api/classroom/student/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, classRoom }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر تسجيل الدخول');
    setState(data.state);
    return data.student as StudentRecord;
  }, []);

  const updateStudent = useCallback(async (studentId: string, patch: Partial<StudentRecord>) => {
    // Optimistic update locally
    setState((prev) => {
      const current = prev.students[studentId];
      if (!current) return prev;
      const merged: StudentRecord = {
        ...current,
        ...patch,
        lastActive: Date.now(),
      };
      if (patch.stationsCompleted) {
        merged.stationsCompleted = Array.from(
          new Set([...current.stationsCompleted, ...patch.stationsCompleted])
        );
      }
      if (patch.formativeAnswers) {
        merged.formativeAnswers = { ...current.formativeAnswers, ...patch.formativeAnswers };
      }
      if (patch.videoCheckpoints) {
        merged.videoCheckpoints = { ...current.videoCheckpoints, ...patch.videoCheckpoints };
      }
      return {
        ...prev,
        students: { ...prev.students, [studentId]: merged },
      };
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'student:update', payload: { studentId, patch } }));
    } else {
      await fetch('/api/classroom/student/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, patch }),
      });
    }
  }, []);

  const awardBadge = useCallback(
    async (studentId: string, emoji: string, label: string, awardedBy: string) => {
      const res = await fetch('/api/classroom/teacher/badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, emoji, label, awardedBy }),
      });
      if (res.ok) {
        const { student } = await res.json();
        setState((prev) => ({
          ...prev,
          students: { ...prev.students, [student.id]: student },
        }));
      }
    },
    []
  );

  const submitRubricEvaluation = useCallback(
    async (studentId: string, evaluation: Omit<RubricEvaluation, 'updatedAt'>) => {
      const res = await fetch('/api/classroom/teacher/rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, evaluation }),
      });
      if (res.ok) {
        const { student } = await res.json();
        setState((prev) => ({
          ...prev,
          students: { ...prev.students, [student.id]: student },
        }));
      }
    },
    []
  );

  const rateLesson = useCallback(
    async (teacherName: string, classRoom: string, emoji: string, label: string, note: string) => {
      const res = await fetch('/api/classroom/teacher/rate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherName, classRoom, emoji, label, note }),
      });
      if (res.ok) {
        const { rating } = await res.json();
        setState((prev) => {
          if (prev.lessonRatings.some((r) => r.id === rating.id)) return prev;
          return { ...prev, lessonRatings: [rating, ...prev.lessonRatings].slice(0, 50) };
        });
      }
    },
    []
  );

  const recordRandomPick = useCallback(
    async (studentId: string, studentName: string, classRoom: ClassSection, pickedBy: string) => {
      const res = await fetch('/api/classroom/teacher/random-pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, studentName, classRoom, pickedBy }),
      });
      if (res.ok) {
        const { pick } = await res.json();
        setState((prev) => ({ ...prev, lastRandomPick: pick }));
      }
    },
    []
  );

  const resetClassData = useCallback(async (classRoom: string) => {
    const res = await fetch('/api/classroom/teacher/reset-class', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classRoom }),
    });
    if (res.ok) {
      const data = await res.json();
      setState(data.state);
    }
  }, []);

  return {
    state,
    connected,
    loading,
    joinStudent,
    updateStudent,
    awardBadge,
    submitRubricEvaluation,
    rateLesson,
    recordRandomPick,
    resetClassData,
  };
}
