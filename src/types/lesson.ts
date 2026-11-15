export type ClassSection = '2م / أ' | '2م / ب' | '2م / ج';
export type TeacherClassFilter = ClassSection | 'الكل';

export interface TeacherBadge {
  id: string;
  emoji: string;
  label: string;
  awardedBy: string;
  timestamp: number;
}

export interface RubricEvaluation {
  understanding: number;
  indentation: number;
  problemSolving: number;
  collaboration: number;
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

export interface BloomObjective {
  level: 'تذكر' | 'فهم' | 'تطبيق' | 'تحليل' | 'تقويم' | 'ابتكار' | 'وجداني' | 'مهاري';
  text: string;
  measurement: string;
}

export interface CoTeachingPhase {
  id: string;
  title: string;
  timeMinutes: number;
  coTeachingModel: string;
  asmaQaisiRole: string;
  asmaSamiliRole: string;
  studentRole: string;
  strategy: string;
  classroomManagement: string;
  tools: string[];
  evaluation: string;
}

export interface VideoCheckpoint {
  timeInSeconds: number;
  question: string;
  options: string[];
  correctIndex: number;
  feedback: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
}

export interface RubricCriterion {
  id: 'understanding' | 'indentation' | 'problemSolving' | 'collaboration';
  title: string;
  weight: string;
  levels: {
    score: 3 | 2 | 1;
    label: string;
    description: string;
  }[];
}
