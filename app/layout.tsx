import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KURSOR IT Passport",
  description:
    "Мини-диагностика для детей: игровой тест + мини-игра на память. В конце — IT Passport."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <div className="pointer-events-none fixed inset-0 noise" />
        {children}
      </body>
    </html>
  );
}

