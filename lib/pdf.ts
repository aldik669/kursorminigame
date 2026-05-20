import { jsPDF } from "jspdf";
import type { FinalResult, RegistrationData } from "@/types";
import { PROFILE_INFO } from "@/lib/scoring";

export function downloadPassportPdf(input: {
  registration: RegistrationData;
  result: FinalResult;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;

  const title = "KURSOR IT Passport";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(title, margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text(`Дата прохождения: ${new Date().toLocaleDateString("ru-RU")}`, margin, y);
  y += 22;

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.text("Данные участника", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.text(`Ребенок: ${input.registration.childName}`, margin, (y += 16));
  doc.text(`Возраст: ${input.registration.childAge}`, margin, (y += 16));
  doc.text(`Родитель: ${input.registration.parentName}`, margin, (y += 16));
  doc.text(`Телефон: ${input.registration.parentPhone}`, margin, (y += 16));
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.text("Сильные качества (топ‑3)", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  input.result.top3Strengths.forEach((s) => {
    doc.text(`• ${s}`, margin, (y += 16));
  });
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Результаты Memory Blocks", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.text(`Memory Score: ${input.result.memoryStats.memoryScore}`, margin, (y += 16));
  doc.text(`Attention Score: ${input.result.memoryStats.attentionScore}`, margin, (y += 16));
  doc.text(`Accuracy: ${input.result.memoryStats.accuracy}%`, margin, (y += 16));
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Топ‑3 направления (без полного раскрытия профессии)", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  input.result.top3Profiles.forEach((k, idx) => {
    const info = PROFILE_INFO[k];
    doc.text(`${idx + 1}. ${info.track} — ${info.title}`, margin, (y += 16));
  });
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Главная профессия", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.text("Главная профессия: будет раскрыта менеджером KURSOR", margin, (y += 16));
  y += 14;

  doc.setTextColor(60);
  doc.setFontSize(11);
  doc.text(
    "Полная расшифровка будет предоставлена менеджером KURSOR.",
    margin,
    (y += 18)
  );

  doc.save(`KURSOR_IT_Passport_${input.registration.childName}.pdf`);
}

