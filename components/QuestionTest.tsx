import { useEffect, useMemo, useState } from "react";
import type { Question, QuestionScores } from "@/types";
import { emptyQuestionScores } from "@/lib/scoring";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";

type Props = {
  questions: Question[];
  onBack: () => void;
  onComplete: (scores: QuestionScores) => void;
};

export function QuestionTest({ questions, onBack, onComplete }: Props) {
  const total = questions.length;
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Record<string, string | undefined>>({});
  const [scores, setScores] = useState<QuestionScores>(() => emptyQuestionScores());

  const q = questions[idx];
  const selectedOptionId = q ? selected[q.id] : undefined;
  const canNext = Boolean(selectedOptionId);

  const progress = useMemo(() => {
    if (total <= 0) return 0;
    return idx / total;
  }, [idx, total]);

  useEffect(() => {
    // soft scroll to top on next question
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [idx]);

  function choose(optionId: string) {
    if (!q) return;
    const option = q.options.find((o) => o.id === optionId);
    if (!option) return;

    setSelected((s) => ({ ...s, [q.id]: optionId }));
  }

  function goNext() {
    if (!q || !selectedOptionId) return;
    const option = q.options.find((o) => o.id === selectedOptionId);
    if (!option) return;

    setScores((prev) => {
      // Recompute deterministically to avoid double-add when user changes choices:
      const next = emptyQuestionScores();
      for (const question of questions) {
        const picked = selected[question.id];
        const pickedOption = question.options.find((o) => o.id === picked);
        if (pickedOption) next[pickedOption.profile] += 1;
      }
      // Apply current choice (in case state timing):
      next[option.profile] += 1;
      return next;
    });

    if (idx === total - 1) {
      const final = (() => {
        const s = emptyQuestionScores();
        for (const question of questions) {
          const picked = selected[question.id];
          const pickedOption = question.options.find((o) => o.id === picked);
          if (pickedOption) s[pickedOption.profile] += 1;
        }
        s[option.profile] += 1;
        return s;
      })();
      onComplete(final);
      return;
    }
    setIdx((i) => i + 1);
  }

  if (!q) {
    return (
      <Card className="p-7 sm:p-10">
        <div className="text-white/80">Нет вопросов. Проверь `lib/questions.ts`.</div>
        <div className="mt-6">
          <Button variant="ghost" onClick={onBack}>
            ← Назад
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-7 sm:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-sm text-white/80">
            <span aria-hidden>🎮</span> игровой тест
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold">{q.title}</h2>
          <div className="mt-2 text-white/70">
            Вопрос <span className="font-semibold text-white">{idx + 1}</span> из{" "}
            <span className="font-semibold text-white">{total}</span>
          </div>
        </div>
        <div className="hidden sm:block text-5xl select-none" aria-hidden>
          🧠
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar value={(idx + 1) / total} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {q.options.map((opt) => {
          const isActive = opt.id === selectedOptionId;
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              className={[
                "text-left rounded-3xl border p-4 sm:p-5 transition-all hover:translate-y-[-1px] active:translate-y-0",
                isActive
                  ? "border-cyan-300/60 bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-purple-600/10 shadow-glow"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "mt-0.5 h-5 w-5 rounded-full border",
                    isActive ? "border-cyan-200 bg-cyan-300/40" : "border-white/20"
                  ].join(" ")}
                  aria-hidden
                />
                <div className="font-semibold leading-snug">{opt.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Назад
        </Button>
        <Button onClick={goNext} disabled={!canNext}>
          Далее <span aria-hidden>➡️</span>
        </Button>
      </div>

      <div className="mt-4 text-xs text-white/60">
        Здесь нет неправильных ответов — каждый вариант показывает стиль мышления.
      </div>
    </Card>
  );
}

