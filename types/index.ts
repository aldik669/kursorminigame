export type FlowStep = "welcome" | "registration" | "test" | "game" | "result";

export type ITProfileKey = "visual" | "game" | "web" | "logic" | "ai" | "cyber";

export type LeadStatus = "new" | "contacted" | "booked_trial" | "paid" | "lost";

export type RegistrationData = {
  childName: string;
  childAge: number;
  parentName: string;
  parentPhone: string;
};

export type QuestionOption = {
  id: string;
  label: string;
  profile: ITProfileKey;
};

export type Question = {
  id: string;
  title: string;
  options: QuestionOption[];
};

export type QuestionScores = Record<ITProfileKey, number>;

export type MemoryStats = {
  memoryScore: number;
  attentionScore: number;
  accuracy: number; // 0..100
  totalCorrect: number;
  totalWrong: number;
  totalMissed: number;
  averageResponseTime: number; // ms
  attempts: number;
  completedLevels: number;
  maxLevelReached: number;
  correctionsCount: number;
  timeToFirstClick: number; // ms
};

export type ProfileInfo = {
  key: ITProfileKey;
  title: string;
  track: string;
  strengths: string;
};

export type FinalResult = {
  questionScores: QuestionScores;
  memoryStats: MemoryStats;
  totalScore: number;
  topProfile: ITProfileKey;
  top3Profiles: ITProfileKey[];
  top3Strengths: string[];
};

export type ResultRow = {
  id: string;
  created_at: string;
  child_name: string;
  child_age: number;
  parent_name: string;
  parent_phone: string;
  question_scores: QuestionScores;
  memory_stats: MemoryStats;
  top_profile: ITProfileKey;
  top3_profiles: ITProfileKey[];
  total_score: number | null;
  accuracy: number | null;
  lead_status: LeadStatus;
};

