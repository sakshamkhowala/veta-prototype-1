import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CloudRain, Gauge, TrainFront } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { clockFrom, formatDelay, statusClasses, statusOf, useLiveTrains } from "@/lib/railsense";

export const Route = createFileRoute("/train/$trainId")({
  head: () => ({
    meta: [
      { title: "Train Route & Predicted Arrivals — RailSense" },
      {
        name: "description",
        content:
          "Station-by-station predicted arrival times for a running train, with scheduled time, prediction and the difference at every stop.",
      },
      { property: "og:title", content: "Train Route & Predicted Arrivals — RailSense" },
      {
        property: "og:description",
        content: "Scheduled versus predicted arrival at every station on the route.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrainDetail,
});

function TrainDetail() {
  const { trainId } = Route.useParams();
  const trains = useLiveTrains();
  const train = trains.find((t) => t.def.id === trainId);

  if (!train) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-navy">Train not found</h1>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  const status = statusOf(train.delay, train.history);
  const stations = train.def.stations;
  const nextStation = stations[train.nextIndex]!;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="size-4" /> Live Dashboard
        </Link>

        <header className="mt-4 rounded-xl border border-border bg-surface p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-brand">{train.def.number}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-navy">{train.def.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {train.def.from} → {train.def.to}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(status)}`}
            >
              {status}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Current delay" value={formatDelay(train.delay)} />
            <Stat label={`ETA at ${nextStation.code}`} value={`${train.etaMinutes} min`} />
            <Stat
              label="Conditions"
              value={`${train.weather} · ${train.congestion} traffic`}
              icons
            />
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Position on route</p>
            <div className="relative mt-3 h-2 w-full rounded-full bg-border">
              <div
                className="h-2 rounded-full bg-brand transition-[width] duration-700"
                style={{
                  width: `${Math.round(((train.nextIndex - 1 + train.progress) / (stations.length - 1)) * 100)}%`,
                }}
              />
              <TrainFront
                className="absolute -top-2 size-6 -translate-x-1/2 rounded-full bg-surface p-1 text-brand shadow-card transition-[left] duration-700"
                style={{
                  left: `${Math.round(((train.nextIndex - 1 + train.progress) / (stations.length - 1)) * 100)}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>{stations[0]!.code}</span>
              <span>{stations[stations.length - 1]!.code}</span>
            </div>
          </div>
        </header>

        <h2 className="mt-8 text-lg font-semibold text-navy">Station timeline</h2>
        <ol className="mt-4 space-y-0">
          {stations.map((s, i) => {
            const passed = i < train.nextIndex;
            const isNext = i === train.nextIndex;
            const applied = passed ? Math.round(train.delay * 0.7) : train.delay;
            const diff = i === 0 ? 0 : applied;
            return (
              <li key={s.code} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                    className={`z-10 mt-1 size-3.5 rounded-full border-2 ${
                      isNext
                        ? "border-brand bg-brand"
                        : passed
                          ? "border-navy bg-navy"
                          : "border-border bg-surface"
                    }`}
                  />
                  {i < stations.length - 1 && (
                    <span className={`w-0.5 flex-1 ${passed ? "bg-navy" : "bg-border"}`} />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg border p-4 ${
                    isNext ? "border-brand bg-brand/5" : "border-border bg-surface"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-navy">
                      {s.name} <span className="text-xs font-normal text-muted-foreground">({s.code})</span>
                    </p>
                    {isNext && (
                      <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        Next stop
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Scheduled</p>
                      <p className="mt-0.5 font-semibold text-navy tabular-nums">
                        {clockFrom(train.def.startLabel, s.schedOffset)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Predicted</p>
                      <p className="mt-0.5 font-semibold text-navy tabular-nums">
                        {clockFrom(train.def.startLabel, s.schedOffset + diff)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Difference</p>
                      <p
                        className={`mt-0.5 font-semibold tabular-nums ${
                          diff <= 3 ? "text-ontime" : diff <= 15 ? "text-warn" : "text-late"
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff} min
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}

function Stat({ label, value, icons }: { label: string; value: string; icons?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icons && <CloudRain className="size-3" />}
        {icons && <Gauge className="size-3" />}
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-navy">{value}</p>
    </div>
  );
}
