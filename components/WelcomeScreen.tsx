import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

type Props = {
  onStart: () => void;
};

export function WelcomeScreen({ onStart }: Props) {
  return (
    <div className="grid gap-6">
      <Card className="p-7 sm:p-10">
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
        </div>

        <div className="mt-10">
          <Button 
            onClick={onStart} 
            className="w-full py-4 text-lg font-bold animate-pulse hover:animate-none transition-all duration-300"
          >
            Начать диагностику <span aria-hidden>🚀</span>
          </Button>
          <div className="mt-4 text-sm text-white/65 text-center">
            Никаких "правильных" ответов — просто выбирай то, что ближе тебе.
          </div>
        </div>
      </Card>

      <Card className="p-7 sm:p-8">
        <div className="text-xl font-bold">Что будет внутри?</div>
        <div className="mt-4 grid gap-3">
          {[
            {
              title: "7 игровых вопросов",
              desc: "Ярких вопросов — выбирай как в игре.",
              icon: "🗯️"
            },
            {
              title: "3 мини-игры",
              desc: "Memory Blocks, логика и внимание.",
              icon: "🎮"
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