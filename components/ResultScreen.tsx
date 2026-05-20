import { useEffect, useMemo, useState } from "react";
import type { FinalResult, MemoryStats, QuestionScores, RegistrationData } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { downloadPassportPdf } from "@/lib/pdf";
import { PROFILE_INFO } from "@/lib/scoring";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  registration: RegistrationData;
  questionScores: QuestionScores;
  memoryStats: MemoryStats;
  finalResult: FinalResult;
  onRestart: () => void;
};

type SaveState = "idle" | "saving" | "success" | "error";

export function ResultScreen({
  registration,
  questionScores,
  memoryStats,
  finalResult,
  onRestart
}: Props) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const top3 = useMemo(() => {
    return finalResult.top3Profiles.map((k) => PROFILE_INFO[k]);
  }, [finalResult.top3Profiles]);

  useEffect(() => {
    let cancelled = false;
    async function save() {
      try {
        setSaveState("saving");
        setSaveError(null);

        const { error } = await supabase.from("results").insert({
          child_name: registration.childName,
          child_age: registration.childAge,
          parent_name: registration.parentName,
          parent_phone: registration.parentPhone,
          question_scores: questionScores,
          memory_stats: memoryStats,
          top_profile: finalResult.topProfile,
          top3_profiles: finalResult.top3Profiles,
          total_score: finalResult.totalScore,
          accuracy: finalResult.memoryStats.accuracy
        });

        if (cancelled) return;
        if (error) throw error;
        setSaveState("success");
      } catch (e) {
        if (cancelled) return;
        setSaveState("error");
        setSaveError(
          e instanceof Error ? e.message : "Не удалось сохранить результат. Попробуйте позже."
        );
      }
    }
    void save();
    return () => {
      cancelled = true;
    };
  }, [finalResult, memoryStats, questionScores, registration]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="p-7 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-sm text-white/80">
              <span aria-hidden>🎫</span> итог
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold">IT Passport готов!</h2>
            <p className="mt-3 text-white/70 leading-relaxed">
              Отличная работа! Ниже — краткие результаты. Полная расшифровка будет
              предоставлена менеджером KURSOR.
            </p>
          </div>
          <div className="hidden sm:block text-5xl select-none" aria-hidden>
            🏁
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Mini label="Имя ребенка" value={registration.childName} icon="🧒" />
          <Mini label="Возраст" value={`${registration.childAge}`} icon="🎂" />
          <Mini label="Memory Score" value={`${memoryStats.memoryScore}`} icon="🧠" />
          <Mini label="Attention Score" value={`${memoryStats.attentionScore}`} icon="👀" />
          <Mini label="Accuracy" value={`${memoryStats.accuracy}%`} icon="🎯" />
          <Mini label="Total score" value={`${finalResult.totalScore}`} icon="⭐" />
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="font-bold">Топ‑3 сильных качества</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {finalResult.top3Strengths.map((s) => (
              <span
                key={s}
                className="rounded-2xl border border-white/10 bg-slate-950/20 px-3 py-1.5 text-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/20 to-white/5 p-5">
          <div className="font-bold">Подходящая IT‑профессия</div>
          <div className="mt-2 text-2xl font-extrabold tracking-wider text-white/90 blur-[6px] select-none">
            {PROFILE_INFO[finalResult.topProfile].title}
          </div>
          <div className="mt-3 text-white/75 leading-relaxed">
            Чтобы точно узнать профессию, которая лучше всего подходит вашему ребенку, наш
            менеджер свяжется с вами в ближайшее время и объяснит результат диагностики.
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Button
            onClick={() => downloadPassportPdf({ registration, result: finalResult })}
            className="sm:w-auto"
          >
            Скачать IT Passport PDF <span aria-hidden>📄</span>
          </Button>
          <Button variant="ghost" onClick={onRestart} className="sm:w-auto">
            Пройти заново ↺
          </Button>
        </div>

        <div className="mt-5">
          {saveState === "saving" ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white/80">
              Сохраняем результат в базу…
            </div>
          ) : null}
          {saveState === "success" ? (
            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100">
              Готово! Результат сохранен ✅
            </div>
          ) : null}
          {saveState === "error" ? (
            <div className="rounded-3xl border border-pink-300/20 bg-pink-300/10 p-4 text-pink-100">
              Не получилось сохранить результат. Ничего страшного — PDF доступен.
              {saveError ? <div className="mt-2 text-sm text-pink-100/90">{saveError}</div> : null}
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="p-7 sm:p-8">
        <div className="text-xl font-bold">Топ‑3 направления</div>
        <div className="mt-4 grid gap-3">
          {top3.map((p) => (
            <div
              key={p.key}
              className="rounded-3xl border border-white/10 bg-slate-950/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.track}</div>
                  <div className="text-white/70 text-sm mt-1">{p.strengths}</div>
                </div>
                <div className="text-2xl select-none" aria-hidden>
                  {p.key === "visual"
                    ? "🎨"
                    : p.key === "game"
                      ? "🎮"
                      : p.key === "web"
                        ? "🕸️"
                        : p.key === "logic"
                          ? "🧩"
                          : p.key === "ai"
                            ? "🤖"
                            : "🛡️"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-white/75 text-sm leading-relaxed">
          <div className="font-semibold text-white mb-1">Заметка для команды</div>
          В MVP данные `/admin` защищены только паролем из `NEXT_PUBLIC_ADMIN_PASSWORD`.
          Для production лучше подключить Supabase Auth и серверные роли.
        </div>
      </Card>
    </div>
  );
}

function Mini({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/60">{label}</div>
          <div className="mt-1 text-lg font-bold">{value}</div>
        </div>
        <div className="text-2xl select-none" aria-hidden>
          {icon}
        </div>
      </div>
    </div>
  );
}

