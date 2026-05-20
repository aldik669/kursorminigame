import { useEffect, useMemo, useRef, useState } from "react";
import type { MemoryStats } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

type Props = {
  onBack: () => void;
  onComplete: (stats: MemoryStats) => void;
};

type LevelConfig = {
  level: number;
  cells: number;
  showMs: number;
};

const LEVELS: LevelConfig[] = [
  { level: 1, cells: 4, showMs: 4000 },
  { level: 2, cells: 5, showMs: 4000 },
  { level: 3, cells: 6, showMs: 3000 },
  { level: 4, cells: 7, showMs: 3000 },
  { level: 5, cells: 8, showMs: 2500 }
];

const GRID = 6;
const TOTAL = GRID * GRID;

function randomPattern(size: number) {
  const set = new Set<number>();
  while (set.size < size) set.add(Math.floor(Math.random() * TOTAL));
  return [...set];
}

export function MemoryBlocksGame({ onBack, onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const [levelIdx, setLevelIdx] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"idle" | "memorize" | "pick" | "checked">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [timerMs, setTimerMs] = useState(0);
  const [gameScore, setGameScore] = useState(0);

  const [check, setCheck] = useState<{
    correct: Set<number>;
    wrong: Set<number>;
    missed: Set<number>;
  } | null>(null);

  // Metrics
  const attemptsRef = useRef(0);
  const completedLevelsRef = useRef(0);
  const maxLevelReachedRef = useRef(1);
  const totalCorrectRef = useRef(0);
  const totalWrongRef = useRef(0);
  const totalMissedRef = useRef(0);
  const correctionsRef = useRef(0);
  const responseTimesRef = useRef<number[]>([]);
  const roundStartRef = useRef<number>(0);
  const firstClickRef = useRef<number | null>(null);
  const lastSelectionRef = useRef<Set<number>>(new Set());

  const level = LEVELS[levelIdx] ?? LEVELS[0]!;

  const accuracy = useMemo(() => {
    const totalAttempts = totalCorrectRef.current + totalWrongRef.current + totalMissedRef.current;
    if (totalAttempts <= 0) return 0;
    return Math.round((100 * totalCorrectRef.current) / totalAttempts);
  }, [timerMs, phase]); // cheap re-render trigger

  const averageResponseTime = useMemo(() => {
    const arr = responseTimesRef.current;
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }, [timerMs, phase]);

  useEffect(() => {
    if (!started) return;
    if (phase !== "memorize" && phase !== "pick") return;
    const id = window.setInterval(() => setTimerMs((x) => x + 1000), 1000);
    return () => window.clearInterval(id);
  }, [started, phase]);

  function startGame() {
    setStarted(true);
    setLevelIdx(0);
    setGameScore(0);
    attemptsRef.current = 0;
    completedLevelsRef.current = 0;
    maxLevelReachedRef.current = 1;
    totalCorrectRef.current = 0;
    totalWrongRef.current = 0;
    totalMissedRef.current = 0;
    correctionsRef.current = 0;
    responseTimesRef.current = [];
    firstClickRef.current = null;
    setTimerMs(0);
    beginLevel(0);
  }

  function beginLevel(idx: number) {
    const cfg = LEVELS[idx] ?? LEVELS[0]!;
    maxLevelReachedRef.current = Math.max(maxLevelReachedRef.current, cfg.level);
    const p = randomPattern(cfg.cells);
    setPattern(p);
    setSelected(new Set());
    lastSelectionRef.current = new Set();
    setCheck(null);
    setMessage(null);
    setShowing(true);
    setPhase("memorize");
    roundStartRef.current = Date.now();
    firstClickRef.current = null;

    window.setTimeout(() => {
      setShowing(false);
      setPhase("pick");
    }, cfg.showMs);
  }

  function toggleCell(i: number) {
    if (!started) return;
    if (showing || phase !== "pick") return;

    if (firstClickRef.current == null) firstClickRef.current = Date.now();

    setSelected((prev) => {
      const next = new Set(prev);
      const had = next.has(i);
      if (had) next.delete(i);
      else next.add(i);

      // corrections metric: any time selection decreases or changes previous picks
      const last = lastSelectionRef.current;
      if (had || last.size > next.size) correctionsRef.current += 1;
      lastSelectionRef.current = new Set(next);
      return next;
    });
  }

  const canCheck = phase === "pick" && selected.size === level.cells;

  function doCheck() {
    if (!canCheck) return;
    attemptsRef.current += 1;

    const p = new Set(pattern);
    const correct = new Set<number>();
    const wrong = new Set<number>();
    for (const x of selected) {
      if (p.has(x)) correct.add(x);
      else wrong.add(x);
    }
    const missed = new Set<number>();
    for (const x of p) {
      if (!selected.has(x)) missed.add(x);
    }

    totalCorrectRef.current += correct.size;
    totalWrongRef.current += wrong.size;
    totalMissedRef.current += missed.size;

    const rt = Date.now() - roundStartRef.current;
    responseTimesRef.current.push(rt);

    setCheck({ correct, wrong, missed });
    setPhase("checked");

    if (wrong.size === 0 && missed.size === 0) {
      completedLevelsRef.current += 1;
      setGameScore((s) => s + level.level * 20);
      setMessage("Отлично! 🎉");
      window.setTimeout(() => {
        if (levelIdx >= LEVELS.length - 1) {
          finish();
        } else {
          setLevelIdx((x) => x + 1);
          beginLevel(levelIdx + 1);
        }
      }, 900);
    } else {
      setMessage("Попробуй еще раз 🙌");
    }
  }

  function retryLevel() {
    beginLevel(levelIdx);
  }

  function finish() {
    const totalCorrect = totalCorrectRef.current;
    const totalWrong = totalWrongRef.current;
    const totalMissed = totalMissedRef.current;
    const total = totalCorrect + totalWrong + totalMissed;
    const acc = total > 0 ? (100 * totalCorrect) / total : 0;

    const firstClick = firstClickRef.current;
    const timeToFirstClick = firstClick ? Math.max(0, firstClick - roundStartRef.current) : 0;

    // Simple derived scores for MVP
    const memoryScore = Math.round(Math.min(100, acc + Math.min(20, (LEVELS.length / LEVELS.length) * 10)));
    const attentionScore = Math.round(Math.min(100, acc - Math.min(20, totalWrong * 3)));

    const stats: MemoryStats = {
      memoryScore,
      attentionScore,
      accuracy: Math.round(acc * 10) / 10,
      totalCorrect,
      totalWrong,
      totalMissed,
      averageResponseTime,
      attempts: attemptsRef.current,
      completedLevels: completedLevelsRef.current,
      maxLevelReached: maxLevelReachedRef.current,
      correctionsCount: correctionsRef.current,
      timeToFirstClick
    };

    onComplete(stats);
  }

  return (
    <Card className="p-7 sm:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-sm text-white/80">
            <span aria-hidden>🧩</span> мини-игра
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold">Memory Blocks</h2>
          <p className="mt-3 text-white/70 leading-relaxed">
            Запомни синие блоки и повтори рисунок.
          </p>
        </div>
        <div className="hidden sm:block text-5xl select-none" aria-hidden>
          🟦
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="Level" value={started ? String(level.level) : "—"} />
        <Stat label="Score" value={started ? String(gameScore) : "—"} />
        <Stat label="Timer" value={started ? `${Math.floor(timerMs / 1000)}s` : "—"} />
        <Stat label="Accuracy" value={started ? `${accuracy}%` : "—"} />
      </div>

      {!started ? (
        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← Назад
          </Button>
          <Button onClick={startGame}>
            Начать игру <span aria-hidden>▶️</span>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-7 grid place-items-center">
            <div className="grid gap-2">
              <div
                className="grid gap-2 rounded-3xl border border-white/10 bg-slate-950/20 p-4"
                style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: TOTAL }).map((_, i) => {
                  const inPattern = pattern.includes(i);
                  const isSelected = selected.has(i);
                  const showPattern = showing && inPattern;
                  const checked = check;
                  const isCorrect = checked?.correct.has(i);
                  const isWrong = checked?.wrong.has(i);
                  const isMissed = checked?.missed.has(i);

                  const color = (() => {
                    if (phase === "checked") {
                      if (isCorrect) return "bg-emerald-400/70";
                      if (isWrong) return "bg-rose-400/70";
                      if (isMissed) return "bg-yellow-300/70";
                      return "bg-white/10";
                    }
                    if (showPattern) return "bg-cyan-300/70";
                    if (isSelected) return "bg-blue-500/70";
                    return "bg-white/10 hover:bg-white/15";
                  })();

                  return (
                    <button
                      key={i}
                      onClick={() => toggleCell(i)}
                      disabled={showing || phase !== "pick"}
                      className={[
                        "h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-white/10 transition",
                        color,
                        isSelected ? "shadow-glow" : ""
                      ].join(" ")}
                      aria-label={`Клетка ${i + 1}`}
                    />
                  );
                })}
              </div>

              <div className="text-center text-sm text-white/70">
                {showing ? "Смотри внимательно… 👀" : "Теперь повтори рисунок 👇"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button variant="ghost" onClick={onBack}>
              ← Назад
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {phase === "checked" && message && (check?.wrong.size || check?.missed.size) ? (
                <Button onClick={retryLevel}>Переиграть уровень</Button>
              ) : null}

              <Button onClick={doCheck} disabled={!canCheck}>
                Проверить <span aria-hidden>✅</span>
              </Button>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-center font-semibold animate-pop">
              {message}
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

