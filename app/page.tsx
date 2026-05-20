"use client";

import { useEffect, useMemo, useState } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { RegistrationForm } from "@/components/RegistrationForm";
import { QuestionTest } from "@/components/QuestionTest";
import { MemoryBlocksGame } from "@/components/MemoryBlocksGame";
import { ResultScreen } from "@/components/ResultScreen";
import type {
  FlowStep,
  RegistrationData,
  QuestionScores,
  MemoryStats,
  FinalResult
} from "@/types";
import { QUESTIONS } from "@/lib/questions";
import { computeFinalResult } from "@/lib/scoring";

export default function HomePage() {
  const [step, setStep] = useState<FlowStep>("welcome");
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [questionScores, setQuestionScores] = useState<QuestionScores | null>(null);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);

  const finalResult: FinalResult | null = useMemo(() => {
    if (!registration || !questionScores || !memoryStats) return null;
    return computeFinalResult({ registration, questionScores, memoryStats });
  }, [registration, questionScores, memoryStats]);

  useEffect(() => {
    const raw = window.localStorage.getItem("kursor-passport-progress");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as {
        step?: FlowStep;
        registration?: RegistrationData | null;
        questionScores?: QuestionScores | null;
        memoryStats?: MemoryStats | null;
      };
      if (data.registration) setRegistration(data.registration);
      if (data.questionScores) setQuestionScores(data.questionScores);
      if (data.memoryStats) setMemoryStats(data.memoryStats);
      if (data.step) setStep(data.step);
    } catch {
      // ignore invalid local cache
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "kursor-passport-progress",
      JSON.stringify({ step, registration, questionScores, memoryStats })
    );
  }, [step, registration, questionScores, memoryStats]);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 rounded-3xl bg-white/10 px-4 py-2 shadow-glow backdrop-blur">
            <div className="text-2xl" aria-hidden>
              🧩
            </div>
            <div className="font-semibold tracking-tight">KURSOR IT Passport</div>
          </div>

          <div className="hidden sm:block text-sm text-white/70">
            Игровая мини-диагностика • 10–12 минут
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "welcome", label: "Старт" },
            { key: "registration", label: "Данные" },
            { key: "test", label: "Тест" },
            { key: "game", label: "Memory" },
            { key: "result", label: "Паспорт" }
          ].map((x) => {
            const active = step === x.key;
            return (
              <div
                key={x.key}
                className={[
                  "rounded-2xl px-3 py-1.5 text-sm border transition",
                  active
                    ? "bg-cyan-300/20 border-cyan-200/40 text-cyan-100"
                    : "bg-white/5 border-white/10 text-white/70"
                ].join(" ")}
              >
                {x.label}
              </div>
            );
          })}
        </div>

        {step === "welcome" && (
          <WelcomeScreen onStart={() => setStep("registration")} />
        )}

        {step === "registration" && (
          <RegistrationForm
            onBack={() => setStep("welcome")}
            onSubmit={(data) => {
              setRegistration(data);
              setStep("test");
            }}
          />
        )}

        {step === "test" && (
          <QuestionTest
            questions={QUESTIONS}
            onBack={() => setStep("registration")}
            onComplete={(scores) => {
              setQuestionScores(scores);
              setStep("game");
            }}
          />
        )}

        {step === "game" && (
          <MemoryBlocksGame
            onBack={() => setStep("test")}
            onComplete={(stats) => {
              setMemoryStats(stats);
              setStep("result");
            }}
          />
        )}

        {step === "result" && registration && questionScores && memoryStats && finalResult && (
          <ResultScreen
            registration={registration}
            questionScores={questionScores}
            memoryStats={memoryStats}
            finalResult={finalResult}
            onRestart={() => {
              setRegistration(null);
              setQuestionScores(null);
              setMemoryStats(null);
              setStep("welcome");
              window.localStorage.removeItem("kursor-passport-progress");
            }}
          />
        )}
      </div>
    </main>
  );
}

