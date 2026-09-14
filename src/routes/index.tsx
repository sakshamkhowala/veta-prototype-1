import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, CloudRain, Gauge, Radio } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import {
  clockFrom,
  formatDelay,
  statusClasses,
  statusOf,
  useLiveTrains,
} from "@/lib/railsense";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RailSense — Live Train Arrival Predictions" },
      {
        name: "description",
        content:
          "A live dashboard of predicted train arrival times for Indian Railways, updating every few seconds from position, weather and track congestion.",
      },
      { property: "og:title", content: "RailSense — Predict. Plan. Arrive Better." },
      {
        property: "og:description",
        content: "Live predicted arrival times for Indian Railways trains, updating every few seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const trains = useLiveTrains();
  const [selectedId, setSelectedId] = useState(trains[0]?.def.id ?? "");
  const selected = trains.find((t) => t.def.id === selectedId) ?? trains[0];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Live Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Predicted arrival times recalculated every few seconds from live conditions.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ontime/30 bg-ontime/10 px-3 py-1 text-xs font-medium text-ontime">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-ontime opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-ontime" />
            </span>
            Live feed active
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {trains.map((t) => {
            const station = t.def.stations[t.nextIndex]!;
            const status = statusOf(t.delay, t.history);
            return (
              <article
                key={t.def.id}
                onClick={() => setSelectedId(t.def.id)}
                className={`cursor-pointer rounded-xl border bg-surface p-5 shadow-card transition-shadow hover:shadow-lift ${
                  selected?.def.id === t.def.id ? "border-brand" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-brand">{t.def.number}</p>
                    <h2 className="text-base font-semibold leading-tight text-navy">{t.def.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t.def.from} → {t.def.to}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses(status)}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-4 rounded-lg bg-muted/60 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Approaching {station.name}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums text-navy">{t.etaMinutes}</span>
                    <span className="text-sm text-muted-foreground">min · ETA</span>
                    <span className="ml-auto text-sm font-semibold text-navy">
                      {clockFrom(t.def.startLabel, station.schedOffset + t.delay)}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-border">
                    <div
                      className="h-1.5 rounded-full bg-brand transition-[width] duration-700"
                      style={{ width: `${Math.round(t.progress * 100)}%` }}
                    />
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Delay</dt>
                    <dd className="mt-0.5 font-semibold text-navy">{formatDelay(t.delay)}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <CloudRain className="size-3" /> Weather
                    </dt>
                    <dd className="mt-0.5 font-semibold text-navy">{t.weather}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <Gauge className="size-3" /> Track
                    </dt>
                    <dd className="mt-0.5 font-semibold text-navy">{t.congestion}</dd>
                  </div>
                </dl>

                <Link
                  to="/train/$trainId"
                  params={{ trainId: t.def.id }}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                >
                  View full route <ArrowRight className="size-3.5" />
                </Link>
              </article>
            );
          })}
        </div>

        {selected && (
          <section className="mt-8 rounded-xl border border-border bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-navy">
                  <Radio className="size-4 text-brand" /> Predicted delay trend
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selected.def.number} · {selected.def.name} — last checkpoints
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Now: <span className="font-semibold text-navy">{formatDelay(selected.delay)}</span>
              </p>
            </div>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selected.history} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="delayFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} unit="m" />
                  <Tooltip
                    formatter={(v: number) => [`${v} min`, "Delay"]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="delay"
                    stroke="var(--brand)"
                    strokeWidth={2}
                    fill="url(#delayFill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
