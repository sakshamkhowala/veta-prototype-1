import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";
import { clockFrom, formatDelay, statusOf, useLiveTrains } from "@/lib/railsense";

export const Route = createFileRoute("/passenger")({
  head: () => ({
    meta: [
      { title: "Passenger View — RailSense Live Train Arrival" },
      {
        name: "description",
        content: "Pick your train and see in large, clear text exactly how many minutes until it arrives.",
      },
      { property: "og:title", content: "RailSense Passenger View" },
      { property: "og:description", content: "How many minutes until your train arrives, in plain words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassengerPage,
});

function PassengerPage() {
  const trains = useLiveTrains();
  const [selected, setSelected] = useState(trains[0]?.def.id ?? "");
  const train = trains.find((t) => t.def.id === selected) ?? trains[0];

  if (!train) return null;

  const station = train.def.stations[train.nextIndex]!;
  const status = statusOf(train.delay, train.history);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto flex max-w-md flex-col px-5 py-8">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Your train
        </label>
        <select
          value={train.def.id}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base font-medium text-navy outline-none focus:border-brand"
        >
          {trains.map((t) => (
            <option key={t.def.id} value={t.def.id}>
              {t.def.number} · {t.def.name}
            </option>
          ))}
        </select>

        <section className="mt-8 rounded-2xl border border-border bg-surface p-7 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Your train arrives at</p>
          <p className="mt-1 text-2xl font-semibold text-navy">{station.name}</p>
          <p className="mt-8 text-sm text-muted-foreground">in</p>
          <p className="text-7xl font-bold leading-none text-brand tabular-nums">{train.etaMinutes}</p>
          <p className="mt-2 text-xl font-medium text-navy">minutes</p>
          <p className="mt-8 text-sm text-muted-foreground">
            Expected at{" "}
            <span className="font-semibold text-navy">
              {clockFrom(train.def.startLabel, station.schedOffset + train.delay)}
            </span>{" "}
            · scheduled {clockFrom(train.def.startLabel, station.schedOffset)}
          </p>
        </section>

        <p className="mt-6 text-center text-base text-muted-foreground">
          {status === "On Time" ? "Running on time." : `Running ${formatDelay(train.delay)} behind.`} Updating
          live.
        </p>
      </main>
    </div>
  );
}
