# KURSOR IT Passport

Игровой deploy-ready MVP на Next.js: диагностика для детей с тестом, mini-game `Memory Blocks`, сохранением в Supabase и генерацией PDF.

## Стек

- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Supabase (`@supabase/supabase-js`)
- jsPDF

## Локальный запуск

1. Установите Node.js 18+ (рекомендуется 20+).
2. Установите зависимости:

```bash
npm install
```

3. Создайте `.env.local` на основе примера:

```bash
cp .env.example .env.local
```

4. Заполните переменные:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_PASSWORD`

5. Запустите dev-сервер:

```bash
npm run dev
```

Откройте:
- пользовательский флоу: `http://localhost:3000`
- админка: `http://localhost:3000/admin`

## Настройка Supabase

1. Создайте новый проект в Supabase.
2. Откройте SQL Editor.
3. Выполните SQL из файла `supabase.sql`.
4. В `Project Settings -> API` возьмите:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> В MVP включены permissive RLS политики для `anon` (insert/select/update).  
> Для production рекомендуется Supabase Auth + строгие role-based policies.

## Деплой на Vercel

1. Подключите GitHub репозиторий в Vercel.
2. Добавьте environment variables в проекте Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
3. Deploy.

Команда сборки по умолчанию:
- `npm run build`

## Структура

```text
/app
  /page.tsx
  /admin/page.tsx
/components
  WelcomeScreen.tsx
  RegistrationForm.tsx
  QuestionTest.tsx
  MemoryBlocksGame.tsx
  ResultScreen.tsx
  AdminPanel.tsx
  ProgressBar.tsx
  Button.tsx
  Card.tsx
/lib
  supabaseClient.ts
  scoring.ts
  pdf.ts
  questions.ts
/types
  index.ts
supabase.sql
```

