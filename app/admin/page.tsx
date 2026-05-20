"use client";

import { AdminPanel } from "@/components/AdminPanel";

export default function AdminPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <AdminPanel />
      </div>
    </main>
  );
}

