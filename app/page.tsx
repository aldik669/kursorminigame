"use client";

import { useMemo, useState } from "react";
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
            }}
          />
        )}
      </div>
    </main>
  );
}

