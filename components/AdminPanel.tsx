"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PROFILE_INFO } from "@/lib/scoring";
import { supabase } from "@/lib/supabaseClient";
import type { ITProfileKey, LeadStatus, ResultRow } from "@/types";

const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "booked_trial", "paid", "lost"];

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState<ITProfileKey | "all">("all");

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

  async function loadRows() {
    try {
      setLoading(true);
      setError(null);
      const { data, error: e } = await supabase
        .from("results")
        .select("*")
        .order("created_at", { ascending: false });
      if (e) throw e;
      setRows((data ?? []) as ResultRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить данные.");
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(id: string, status: LeadStatus) {
    const prev = rows;
    setRows((curr) => curr.map((r) => (r.id === id ? { ...r, lead_status: status } : r)));
    const { error: e } = await supabase.from("results").update({ lead_status: status }).eq("id", id);
    if (e) {
      setRows(prev);
      setError(`Ошибка обновления статуса: ${e.message}`);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesText =
        !q ||
        r.child_name.toLowerCase().includes(q) ||
        r.parent_name.toLowerCase().includes(q) ||
        r.parent_phone.toLowerCase().includes(q);
      const matchesProfile = profileFilter === "all" || r.top_profile === profileFilter;
      return matchesText && matchesProfile;
    });
  }, [profileFilter, query, rows]);

  function exportCsv() {
    const header = [
      "date",
      "child_name",
      "child_age",
      "parent_name",
      "parent_phone",
      "top_profile",
      "top3_profiles",
      "accuracy",
      "total_score",
      "lead_status"
    ];
    const lines = filtered.map((r) =>
      [
        new Date(r.created_at).toLocaleString("ru-RU"),
        r.child_name,
        r.child_age,
        r.parent_name,
        r.parent_phone,
        r.top_profile,
        (r.top3_profiles ?? []).join("|"),
        r.accuracy ?? "",
        r.total_score ?? "",
        r.lead_status
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kursor-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authorized) {
    return (
      <Card className="p-7 sm:p-10">
        <h1 className="text-3xl font-extrabold">Admin Panel</h1>
        <p className="mt-2 text-white/70">
          Введите пароль. Это MVP-защита, для production лучше использовать Supabase Auth.
        </p>
        <div className="mt-6 max-w-md">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-300/20"
          />
        </div>
        <div className="mt-4">
          <Button
            onClick={() => {
              if (!adminPassword) {
                setError("Не задан NEXT_PUBLIC_ADMIN_PASSWORD.");
                return;
              }
              if (password === adminPassword) {
                setAuthorized(true);
                void loadRows();
              } else {
                setError("Неверный пароль.");
              }
            }}
          >
            Войти
          </Button>
        </div>
        {error ? <div className="mt-4 text-pink-200">{error}</div> : null}
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold">Admin Panel</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => void loadRows()} isLoading={loading}>
            Обновить
          </Button>
          <Button onClick={exportCsv}>Export CSV</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени или телефону"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-300/20"
        />
        <select
          value={profileFilter}
          onChange={(e) => setProfileFilter(e.target.value as ITProfileKey | "all")}
          className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-300/20"
        >
          <option value="all">Все профили</option>
          {(Object.keys(PROFILE_INFO) as ITProfileKey[]).map((key) => (
            <option key={key} value={key}>
              {key} — {PROFILE_INFO[key].title}
            </option>
          ))}
        </select>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/75">
          Найдено: {filtered.length}
        </div>
      </div>

      {error ? <div className="mt-4 text-pink-200">{error}</div> : null}

      <div className="mt-6 overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-[1050px] w-full text-sm">
          <thead className="bg-white/10">
            <tr>
              {[
                "Дата",
                "Ребенок",
                "Возраст",
                "Родитель",
                "Телефон",
                "Главный профиль",
                "Топ-3 профиля",
                "Accuracy",
                "Total score",
                "Lead status"
              ].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-3 py-2">{new Date(r.created_at).toLocaleString("ru-RU")}</td>
                <td className="px-3 py-2">{r.child_name}</td>
                <td className="px-3 py-2">{r.child_age}</td>
                <td className="px-3 py-2">{r.parent_name}</td>
                <td className="px-3 py-2">{r.parent_phone}</td>
                <td className="px-3 py-2">{r.top_profile}</td>
                <td className="px-3 py-2">{(r.top3_profiles ?? []).join(", ")}</td>
                <td className="px-3 py-2">{r.accuracy ?? "—"}</td>
                <td className="px-3 py-2">{r.total_score ?? "—"}</td>
                <td className="px-3 py-2">
                  <select
                    value={r.lead_status}
                    onChange={(e) => void updateLeadStatus(r.id, e.target.value as LeadStatus)}
                    className="rounded-xl border border-white/10 bg-slate-900/80 px-2 py-1"
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-white/70" colSpan={10}>
                  Нет данных.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

