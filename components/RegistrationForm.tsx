import { useMemo, useState, type HTMLAttributes } from "react";
import type { RegistrationData } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

type Props = {
  onBack: () => void;
  onSubmit: (data: RegistrationData) => void;
};

type Errors = Partial<Record<keyof RegistrationData, string>>;

function normalizePhone(input: string) {
  return input.replace(/[^\d+]/g, "");
}

function formatPhoneDisplay(input: string): string {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 1) return "+" + digits;
  if (digits.length <= 3) return "+" + digits.substring(0, 1) + "(" + digits.substring(1);
  if (digits.length <= 6) return "+" + digits.substring(0, 1) + "(" + digits.substring(1, 4) + ") " + digits.substring(4);
  return "+" + digits.substring(0, 1) + "(" + digits.substring(1, 4) + ") " + digits.substring(4, 6) + "* ****";
}

export function RegistrationForm({ onBack, onSubmit }: Props) {
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState<string>("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [touched, setTouched] = useState<Partial<Record<keyof RegistrationData, boolean>>>({});

  const errors: Errors = useMemo(() => {
    const e: Errors = {};
    const age = Number(childAge);

    if (!childName.trim()) e.childName = "Введите имя ребенка.";
    if (!childAge.trim()) e.childAge = "Введите возраст ребенка.";
    if (childAge.trim() && (!Number.isFinite(age) || age < 5 || age > 17)) {
      e.childAge = "Возраст должен быть от 5 до 17.";
    }
    if (!parentName.trim()) e.parentName = "Введите имя родителя.";
    if (!parentPhone.trim()) e.parentPhone = "Введите номер телефона.";
    
    const phoneDigits = normalizePhone(parentPhone).replace(/\+/g, "");
    if (parentPhone.trim() && (phoneDigits.length < 11 || phoneDigits.length > 11)) {
      e.parentPhone = "Номер не корректный";
    }
    
    return e;
  }, [childName, childAge, parentName, parentPhone]);

  const canSubmit = Object.keys(errors).length === 0;

  function submit() {
    setTouched({ childName: true, childAge: true, parentName: true, parentPhone: true });
    if (!canSubmit) return;
    onSubmit({
      childName: childName.trim(),
      childAge: Number(childAge),
      parentName: parentName.trim(),
      parentPhone: normalizePhone(parentPhone)
    });
  }

  return (
    <Card className="p-7 sm:p-10">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-sm text-white/80">
            <span aria-hidden>📝</span> регистрация
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold">Перед стартом — немного данных</h2>
          <p className="mt-3 text-white/70 leading-relaxed">
            Мы сохраним результат и подготовим IT Passport для родителя.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field
          label="Имя ребенка"
          value={childName}
          onChange={setChildName}
          placeholder="Введите имя"
          error={touched.childName ? errors.childName : undefined}
          onBlur={() => setTouched((t) => ({ ...t, childName: true }))}
        />
        <Field
          label="Возраст ребенка (5–17)"
          value={childAge}
          onChange={(v) => setChildAge(v.replace(/[^\d]/g, ""))}
          placeholder="Например: 10"
          inputMode="numeric"
          error={touched.childAge ? errors.childAge : undefined}
          onBlur={() => setTouched((t) => ({ ...t, childAge: true }))}
        />
        <Field
          label="Имя родителя"
          value={parentName}
          onChange={setParentName}
          placeholder="Введите имя"
          error={touched.parentName ? errors.parentName : undefined}
          onBlur={() => setTouched((t) => ({ ...t, parentName: true }))}
        />
        <Field
          label="Телефон родителя"
          value={parentPhone}
          onChange={setParentPhone}
          displayValue={formatPhoneDisplay(parentPhone)}
          placeholder="+7(777) *** ****"
          inputMode="tel"
          error={touched.parentPhone ? errors.parentPhone : undefined}
          onBlur={() => setTouched((t) => ({ ...t, parentPhone: true }))}
        />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="sm:w-auto">
          ← Назад
        </Button>
        <Button onClick={submit} disabled={!canSubmit} className="sm:w-auto">
          Продолжить <span aria-hidden>✨</span>
        </Button>
      </div>

      <div className="mt-4 text-xs text-white/60">
        MVP-защита данных: результат сохраняется в Supabase по anon key. Для production
        рекомендуется Supabase Auth и серверная валидация.
      </div>
    </Card>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  displayValue?: string;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
  onBlur?: () => void;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-white/85">{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        inputMode={props.inputMode}
        className={`mt-2 w-full rounded-2xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20 ${
          props.error ? "border-pink-300/50" : "border-white/10"
        }`}
      />
      {props.displayValue && props.displayValue !== props.value && (
        <div className="mt-2 text-xs text-white/50">Отображение: {props.displayValue}</div>
      )}
      {props.error ? <div className="mt-2 text-sm text-pink-200">{props.error}</div> : null}
    </div>
  );
}