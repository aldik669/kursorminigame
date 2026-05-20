import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

type Props = {
  onStart: () => void;
};

export function WelcomeScreen({ onStart }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="p-7 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-sm text-white/80">
              <span aria-hidden>✨</span> мини-диагностика
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
              KURSOR IT Passport
            </h1>
            <p className="mt-4 text-white/85 text-lg leading-relaxed">
              Мини-игра для детей, которая помогает определить склонность ребенка к IT и
              выявить его сильные стороны в мире технологий.
            </p>
            <p className="mt-3 text-white/70 leading-relaxed">
              Ребенок пройдет короткий игровой тест и мини-игру на память, внимание и
              логику. В конце родитель получит персональный IT Passport.
            </p>
          </div>

          <div className="hidden sm:flex select-none items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/25 via-purple-500/20 to-yellow-300/20 border border-white/10 p-5 animate-float">
            <div className="text-5xl" aria-hidden>
              🚀
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            { title: "Без школьных оценок", icon: "🎈" },
            { title: "Нет неправильных ответов", icon: "🌈" },
            { title: "Показывает сильные стороны ребенка", icon: "🏆" }
          ].map((x) => (
            <div
              key={x.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="text-2xl" aria-hidden>
                {x.icon}
              </div>
              <div className="mt-2 font-semibold">{x.title}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button onClick={onStart} className="w-full sm:w-auto">
            Начать тест <span aria-hidden>➡️</span>
          </Button>
          <div className="text-sm text-white/65">
            Никаких “правильных” ответов — просто выбирай то, что ближе тебе.
          </div>
        </div>
      </Card>

      <Card className="p-7 sm:p-8">
        <div className="text-xl font-bold">Что будет внутри?</div>
        <div className="mt-4 grid gap-3">
          {[
            {
              title: "Игровые вопросы",
              desc: "12 ярких вопросов — выбирай как в игре.",
              icon: "🗯️"
            },
            {
              title: "Memory Blocks",
              desc: "Запомни узор и повтори. Внимание + память.",
              icon: "🧠"
            },
            { title: "IT Passport", desc: "Скачай PDF-результат для родителя.", icon: "📄" }
          ].map((x) => (
            <div
              key={x.title}
              className="rounded-3xl bg-slate-950/20 border border-white/10 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl" aria-hidden>
                  {x.icon}
                </div>
                <div>
                  <div className="font-semibold">{x.title}</div>
                  <div className="text-white/70 text-sm mt-1 leading-relaxed">{x.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-white/75 text-sm leading-relaxed">
          <div className="font-semibold text-white mb-1">Важно</div>
          Это не экзамен и не проверка знаний. Мы смотрим на стиль мышления и интересы.
        </div>
      </Card>
    </div>
  );
}

