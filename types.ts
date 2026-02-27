
export interface ProsodyAnalysis {
  verse: string;
  diacritizedVerse: string;
  meter: string; // Sea (Bahr) name
  scanning: string; // Symbols like — ◡ — —
  feet: string[]; // Taf'ilat
  syllables: string[];
  explanation: string;
  isCorrect: boolean;
  errors?: string[];
}

export interface PoetryGeneration {
  prompt: string;
  generatedVerses: string[];
  meter: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

export enum AppTab {
  ANALYSIS = 'analysis',
  LEARNING = 'learning',
  GENERATOR = 'generator',
  HISTORY = 'history'
}

export interface QuizQuestion {
  id: string;
  type: 'knowledge' | 'skill';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}

export interface AssessmentFeedback {
  isCorrect: boolean;
  score: number;
  message: string;
  guidance: string;
}

export interface SessionStat {
  timestamp: number;
  correct: number;
  total: number;
  avgTime: number; // in seconds
}

export interface AdvancedStats {
  totalCorrect: number;
  totalQuestions: number;
  totalTime: number; // in ms
  missedTypes: Record<string, number>;
  sessionHistory: SessionStat[];
}
