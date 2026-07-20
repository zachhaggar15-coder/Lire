"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { AdminValidationReport } from "@/lib/validation/admin";

type LoadState = "idle" | "loading" | "ready" | "error";
type AdminResponse = { ok: true; report: AdminValidationReport } | { ok: false; error: string };

const TOKEN_KEY = "lire.validation.adminToken";

function dateInput(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function isoStart(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function isoEnd(value: string): string {
  return new Date(`${value}T23:59:59.999Z`).toISOString();
}

function label(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

function numberLabel(value: unknown): string {
  if (typeof value !== "number") return String(value ?? "-");
  return new Intl.NumberFormat().format(value);
}

function percentLabel(value: number | null | undefined, alreadyPercent = false): string {
  if (value == null || !Number.isFinite(value)) return "-";
  const percent = alreadyPercent ? value : value * 100;
  return `${Math.round(percent * 10) / 10}%`;
}

function msLabel(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  if (value < 1000) return `${Math.round(value)}ms`;
  const seconds = Math.round(value / 100) / 10;
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 6) / 10}m`;
}

function numberRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, number] => typeof entry[1] === "number")
  );
}

function pairList(value: unknown): Array<[string, number]> {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is [string, number] => Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "number");
}

function statusClass(status: string): string {
  if (status === "meeting-target") return "bg-emerald-100 text-emerald-800";
  if (status === "approaching-target") return "bg-amber-100 text-amber-800";
  if (status === "below-target") return "bg-rose-100 text-rose-800";
  return "bg-cream-dark text-ink-muted";
}

export default function ValidationDashboard() {
  const [token, setToken] = useState("");
  const [from, setFrom] = useState(dateInput(30));
  const [to, setTo] = useState(dateInput(0));
  const [environment, setEnvironment] = useState("production");
  const [source, setSource] = useState("all");
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AdminValidationReport | null>(null);

  useEffect(() => {
    setToken(window.sessionStorage.getItem(TOKEN_KEY) ?? "");
  }, []);

  const sourceOptions = useMemo(() => {
    const sources = new Set(["all"]);
    report?.acquisition.forEach((row) => {
      if (typeof row.source === "string") sources.add(row.source);
    });
    return [...sources];
  }, [report]);

  async function load(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!token.trim()) {
      setState("error");
      setError("Enter the admin token.");
      return;
    }
    setState("loading");
    setError(null);
    window.sessionStorage.setItem(TOKEN_KEY, token.trim());

    const params = new URLSearchParams({
      from: isoStart(from),
      to: isoEnd(to),
      environment,
    });
    if (source !== "all") params.set("source", source);

    const response = await fetch(`/api/admin/validation?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token.trim()}` },
    });
    const payload = (await response.json()) as AdminResponse;
    if (!response.ok || !payload.ok) {
      setState("error");
      setError(payload.ok ? "Could not load validation report." : payload.error);
      return;
    }
    setReport(payload.report);
    setState("ready");
  }

  const androidDemand = report?.androidDemand ?? {};
  const feedback = report?.feedback ?? {};
  const feedbackCategories = numberRecord(feedback.categories);
  const researchResponses = numberRecord(feedback.researchPromptResponses);
  const recentComments = Array.isArray(feedback.recentComments) ? feedback.recentComments : [];

  return (
    <main className="px-4 pt-6 pb-10">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Admin</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">Validation dashboard</h1>
        {report && (
          <p className="mt-1 text-xs text-ink-muted">
            {new Date(report.dateRange.from).toLocaleDateString()} to {new Date(report.dateRange.to).toLocaleDateString()} - generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        )}
      </header>

      <form onSubmit={load} className="mb-5 grid gap-3 rounded-2xl bg-cream-card p-4 shadow-card md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] md:items-end">
        <label className="block">
          <span className="text-xs font-semibold text-ink-muted">Token</span>
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="mt-1 w-full rounded-xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-ink-muted">From</span>
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 w-full rounded-xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-ink-muted">To</span>
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 w-full rounded-xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-ink-muted">Environment</span>
          <select value={environment} onChange={(event) => setEnvironment(event.target.value)} className="mt-1 w-full rounded-xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30">
            <option value="production">Production</option>
            <option value="preview">Preview</option>
            <option value="local">Local</option>
            <option value="all">All</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-ink-muted">Source</span>
          <select value={source} onChange={(event) => setSource(event.target.value)} className="mt-1 w-full rounded-xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30">
            {sourceOptions.map((item) => (
              <option key={item} value={item}>{label(item)}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={state === "loading"} className="rounded-full bg-brand px-5 py-2.5 shadow-raised text-sm font-semibold text-white active:scale-95 disabled:opacity-50">
          {state === "loading" ? "Loading" : "Load"}
        </button>
      </form>

      {error && <p className="mb-5 rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

      {!report && state !== "loading" && (
        <section className="rounded-2xl bg-cream-card p-5 text-sm text-ink-muted shadow-card">
          Enter the token from `VALIDATION_ADMIN_TOKEN` to load the current validation report.
        </section>
      )}

      {report && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Overview</h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {Object.entries(report.overview).map(([key, value]) => (
                <Metric key={key} label={label(key)} value={numberLabel(value)} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-cream-card p-4 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Validation targets</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="py-2 pr-3">Goal</th>
                    <th className="py-2 pr-3">Rate</th>
                    <th className="py-2 pr-3">Target</th>
                    <th className="py-2 pr-3">Sample</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-dark">
                  {report.goals.map((goal) => (
                    <tr key={goal.id}>
                      <td className="py-3 pr-3 font-semibold text-ink">{goal.label}</td>
                      <td className="py-3 pr-3 text-ink">{percentLabel(goal.rate)}</td>
                      <td className="py-3 pr-3 text-ink-muted">{percentLabel(goal.targetRate)}</td>
                      <td className="py-3 pr-3 text-ink-muted">{goal.numerator}/{goal.denominator}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(goal.status)}`}>{label(goal.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Panel title="Funnel">
              <div className="space-y-2">
                {report.funnel.map((row) => (
                  <div key={row.step} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl bg-cream px-3 py-2 text-sm">
                    <span className="font-semibold text-ink">{row.step}</span>
                    <span className="text-ink">{numberLabel(row.count)}</span>
                    <span className="text-xs font-semibold text-ink-muted">{row.conversionFromPrevious == null ? "-" : percentLabel(row.conversionFromPrevious, true)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Retention">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(report.retention).map(([key, value]) => (
                  <Metric key={key} label={label(key)} value={key.includes("day") || key.includes("rolling") ? percentLabel(value, true) : numberLabel(value)} compact />
                ))}
              </div>
            </Panel>
          </section>

          <section className="rounded-2xl bg-cream-card p-4 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Acquisition</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3">Users</th>
                    <th className="py-2 pr-3">Select</th>
                    <th className="py-2 pr-3">Meaningful</th>
                    <th className="py-2 pr-3">Activate</th>
                    <th className="py-2 pr-3">Return</th>
                    <th className="py-2">Android</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-dark">
                  {report.acquisition.map((row) => (
                    <tr key={String(row.source)}>
                      <td className="py-3 pr-3 font-semibold text-ink">{String(row.source)}</td>
                      <td className="py-3 pr-3 text-ink">{numberLabel(row.users)}</td>
                      <td className="py-3 pr-3 text-ink-muted">{percentLabel(Number(row.articleSelectionRate), true)}</td>
                      <td className="py-3 pr-3 text-ink-muted">{percentLabel(Number(row.meaningfulSessionRate), true)}</td>
                      <td className="py-3 pr-3 text-ink-muted">{percentLabel(Number(row.activationRate), true)}</td>
                      <td className="py-3 pr-3 text-ink-muted">{percentLabel(Number(row.rolling7ReturnRate), true)}</td>
                      <td className="py-3 text-ink-muted">{percentLabel(Number(row.androidBetaRate), true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Panel title="Learning behaviour">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(report.learningBehaviour).map(([key, value]) => (
                  <Metric key={key} label={label(key)} value={key.toLowerCase().includes("ms") ? msLabel(value) : numberLabel(value)} compact />
                ))}
              </div>
            </Panel>

            <Panel title="Android demand">
              <div className="grid grid-cols-2 gap-2">
                {["ctaImpressions", "ctaClicks", "formStarts", "formSubmissions", "clickToSubmissionRate", "registrationAmongActivatedUsers", "registrationAmongStronglyActivatedUsers"].map((key) => (
                  <Metric
                    key={key}
                    label={label(key)}
                    value={key.toLowerCase().includes("rate") || key.toLowerCase().includes("among") ? percentLabel(Number(androidDemand[key]), true) : numberLabel(androidDemand[key])}
                    compact
                  />
                ))}
              </div>
              <Distribution title="French levels" values={numberRecord(androidDemand.frenchLevelDistribution)} />
              <Distribution title="Android ownership" values={numberRecord(androidDemand.androidOwnership)} />
            </Panel>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Panel title="Cohorts">
              <div className="space-y-2">
                {report.cohorts.map((row) => (
                  <div key={String(row.week)} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 rounded-xl bg-cream px-3 py-2 text-sm">
                    <span className="font-semibold text-ink">{String(row.week)}</span>
                    <span>{numberLabel(row.users)}</span>
                    <span className="text-ink-muted">{percentLabel(Number(row.activationRate), true)}</span>
                    <span className="text-ink-muted">{percentLabel(Number(row.rolling7ReturnRate), true)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Feedback">
              <Distribution title="Categories" values={feedbackCategories} />
              <Distribution title="Research prompts" values={researchResponses} />
              {recentComments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Recent comments</h3>
                  {recentComments.slice(0, 5).map((item, index) => {
                    const row = item as Record<string, unknown>;
                    return (
                      <div key={`${String(row.createdAt)}-${index}`} className="rounded-xl bg-cream px-3 py-2 text-sm">
                        <p className="text-xs font-semibold text-brand">{String(row.category ?? "feedback")} - {String(row.feature ?? "general")}</p>
                        <p className="mt-1 text-ink-muted">{String(row.comment ?? "")}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </section>

          {(pairList(androidDemand.motivations).length > 0 || pairList(androidDemand.desiredImprovements).length > 0) && (
            <section className="grid gap-4 lg:grid-cols-2">
              <PairPanel title="Beta motivations" values={pairList(androidDemand.motivations)} />
              <PairPanel title="Desired improvements" values={pairList(androidDemand.desiredImprovements)} />
            </section>
          )}
        </div>
      )}
    </main>
  );
}

function Metric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl bg-cream-card shadow-card ${compact ? "p-3" : "p-4"}`}>
      <p className={`${compact ? "text-lg" : "text-2xl"} font-extrabold text-ink`}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-cream-card p-4 shadow-card">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h2>
      {children}
    </section>
  );
}

function Distribution({ title, values }: { title: string; values: Record<string, number> }) {
  const entries = Object.entries(values);
  if (entries.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {entries.map(([key, value]) => (
          <span key={key} className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink">
            {label(key)}: {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function PairPanel({ title, values }: { title: string; values: Array<[string, number]> }) {
  return (
    <Panel title={title}>
      <div className="space-y-2">
        {values.map(([text, count]) => (
          <div key={text} className="rounded-xl bg-cream px-3 py-2 text-sm">
            <p className="font-semibold text-ink">{text}</p>
            <p className="text-xs text-ink-muted">{count} submission{count === 1 ? "" : "s"}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
