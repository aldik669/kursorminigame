import type {
  FinalResult,
  ITProfileKey,
  MemoryStats,
  ProfileInfo,
  QuestionScores,
  RegistrationData
} from "@/types";

export const PROFILE_INFO: Record<ITProfileKey, ProfileInfo> = {
  visual: {
    key: "visual",
    title: "Creative Developer",
    track: "Scratch / визуальное программирование",
    strengths: "визуальное мышление, интерактивность, анимации"
  },
  game: {
    key: "game",
    title: "Game Developer",
    track: "Game Development",
    strengths: "игровая логика, уровни, правила, вовлечение"
  },
  web: {
    key: "web",
    title: "Frontend Developer",
    track: "Web-разработка",
    strengths: "интерфейсы, кнопки, структура сайта, удобство"
  },
  logic: {
    key: "logic",
    title: "Python / Software Developer",
    track: "Python / логика и алгоритмы",
    strengths: "логика, алгоритмы, последовательность, решение задач"
  },
  ai: {
    key: "ai",
    title: "Data / AI Specialist",
    track: "Data / AI basics",
    strengths: "данные, закономерности, прогнозы, AI-мышление"
  },
  cyber: {
    key: "cyber",
    title: "Cybersecurity / QA Engineer",
    track: "Кибербезопасность / поиск ошибок",
    strengths: "внимательность, поиск ошибок, защита, проверка"
  }
};

export function emptyQuestionScores(): QuestionScores {
  return { visual: 0, game: 0, web: 0, logic: 0, ai: 0, cyber: 0 };
}

function sortedProfiles(scores: QuestionScores): ITProfileKey[] {
  return (Object.keys(scores) as ITProfileKey[]).sort((a, b) => {
    const d = scores[b] - scores[a];
    if (d !== 0) return d;
    return a.localeCompare(b);
  });
}

function applyMiniGameInfluence(
  questionScores: QuestionScores,
  memoryStats: MemoryStats
): QuestionScores {
  const scores: QuestionScores = { ...questionScores };
  const fastMs = 900;

  if (memoryStats.accuracy >= 90) scores.logic += 1;
  if (memoryStats.accuracy >= 90 && memoryStats.averageResponseTime <= fastMs) scores.game += 1;
  if (memoryStats.correctionsCount > 3) scores.cyber += 1;
  if (memoryStats.completedLevels >= 4) scores.visual += 1;
  if (memoryStats.accuracy >= 80 && memoryStats.totalMissed <= 2) scores.ai += 1;

  return scores;
}

function strengthsFromTop3(top3: ITProfileKey[]): string[] {
  const strengths = top3.flatMap((k) =>
    PROFILE_INFO[k].strengths.split(",").map((s) => s.trim())
  );
  const uniq: string[] = [];
  for (const s of strengths) {
    if (!uniq.includes(s)) uniq.push(s);
  }
  return uniq.slice(0, 3);
}

export function computeFinalResult(input: {
  registration: RegistrationData;
  questionScores: QuestionScores;
  memoryStats: MemoryStats;
}): FinalResult {
  const influenced = applyMiniGameInfluence(input.questionScores, input.memoryStats);
  const ranking = sortedProfiles(influenced);
  const top3 = ranking.slice(0, 3);
  const topProfile = ranking[0] ?? "visual";
  const totalScore = Object.values(influenced).reduce((a, b) => a + b, 0);

  return {
    questionScores: influenced,
    memoryStats: input.memoryStats,
    totalScore,
    topProfile,
    top3Profiles: top3,
    top3Strengths: strengthsFromTop3(top3)
  };
}

