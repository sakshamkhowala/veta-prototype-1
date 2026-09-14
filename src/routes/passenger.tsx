import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppNav } from "@/components/AppNav";
import { VetaLogo } from "@/components/VetaLogo";
import {
  clockFrom,
  formatDelay,
  statusOf,
  statusClasses,
  statusDotClass,
  useLiveTrains,
  useCountdownSeconds,
  calculateEtaForStation,
} from "@/lib/veta";
import {
  TrainFront,
  Clock,
  MapPin,
  Sparkles,
  Bell,
  CheckCircle,
  Share2,
  Smartphone,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/passenger")({
  head: () => ({
    meta: [
      { title: "Passenger View — Veta Live Train Arrival" },
      {
        name: "description",
        content:
          "Pick your Indian Railways train and see in large, distraction-free text exactly how many minutes until it arrives at your station.",
      },
      { property: "og:title", content: "Veta — Passenger Live Arrival Screen" },
      {
        property: "og:description",
        content: "Simplified, mobile-friendly live train arrival countdown for passengers.",
      },
    ],
  }),
  component: PassengerPage,
});

function PassengerPage() {
  const trains = useLiveTrains();
  const secondsLeft = useCountdownSeconds();

  const [selectedTrainId, setSelectedTrainId] = useState(trains[0]?.def.id ?? "12951");
  const train = trains.find((t) => t.def.id === selectedTrainId) ?? trains[0];

  // Selected station index (defaults to next immediate station)
  const [stationIndex, setStationIndex] = useState<number | null>(null);
  const [alertSubscribed, setAlertSubscribed] = useState(false);

  // If train changes or stationIndex is unselected, fall back to nextIndex
  const activeStationIndex = useMemo(() => {
    if (!train) return 0;
    if (stationIndex !== null && stationIndex >= train.nextIndex && stationIndex < train.def.stations.length) {
      return stationIndex;
    }
    return train.nextIndex;
  }, [train, stationIndex]);

  if (!train) return null;

  const targetStation = train.def.stations[activeStationIndex]!;
  const etaMinutes = calculateEtaForStation(train, activeStationIndex);
  const status = statusOf(train.delay, train.history);

  // Scheduled and predicted arrival times at the target station
  const schedTime = clockFrom(train.def.startLabel, targetStation.schedOffset);
  const expectedTime = clockFrom(
    train.def.startLabel,
    targetStation.schedOffset + (activeStationIndex < train.nextIndex ? 0 : train.delay)
  );

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800">
      <AppNav />

      <main className="mx-auto flex max-w-lg flex-col px-4 py-8 sm:px-6">
        {/* Top Context Pill */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live ETA Telemetry (updates in {secondsLeft}s)
          </span>

          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Smartphone className="size-3 text-slate-400" /> Passenger Mode
          </span>
        </div>

        {/* Train Selector Dropdown */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Select Your Train
          </label>
          <div className="relative mt-1.5">
            <select
              value={train.def.id}
              onChange={(e) => {
                setSelectedTrainId(e.target.value);
                setStationIndex(null); // reset station selection to next stop
              }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-sm font-bold text-[#1F3864] outline-none transition-colors focus:border-[#1565C0] focus:bg-white"
            >
              {trains.map((t) => (
                <option key={t.def.id} value={t.def.id}>
                  {t.def.number} · {t.def.name} ({t.def.from} → {t.def.to})
                </option>
              ))}
            </select>
          </div>

          {/* Station Selector Dropdown */}
          <div className="mt-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              I Am Boarding / Waiting At
            </label>
            <div className="relative mt-1.5">
              <select
                value={activeStationIndex}
                onChange={(e) => setStationIndex(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-[#1565C0] focus:bg-white"
              >
                {train.def.stations.map((s, idx) => {
                  const isPassed = idx < train.nextIndex;
                  return (
                    <option key={s.code} value={idx} disabled={isPassed}>
                      {s.name} ({s.code}) {isPassed ? "— [Train Already Departed]" : idx === train.nextIndex ? "— [Next Immediate Stop]" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Minimalist, High-Contrast Passenger Focus Screen */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg transition-all duration-300">
          <VetaLogo className="size-16 mx-auto mb-3 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-xs" />

          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Your train arrives at
          </p>

          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#1F3864]">
            {targetStation.name}
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Station Code: {targetStation.code}
          </span>

          <div className="mt-6 border-y border-slate-100 py-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              in approximately
            </p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-7xl sm:text-8xl font-black tabular-nums tracking-tight text-[#1565C0] animate-in fade-in">
                {etaMinutes}
              </span>
            </div>
            <p className="mt-1 text-xl font-bold uppercase tracking-wider text-[#1F3864]">
              Minutes
            </p>
          </div>

          {/* Timetable Comparison */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Expected At</span>
              <span className="text-base font-extrabold text-[#1F3864] block tabular-nums mt-0.5">
                {expectedTime}
              </span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Scheduled Time</span>
              <span className="text-base font-bold text-slate-600 block tabular-nums mt-0.5">
                {schedTime}
              </span>
            </div>
          </div>

          {/* Plain Language Status Note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${statusClasses(
                status
              )}`}
            >
              <span className={`size-2 rounded-full ${statusDotClass(status)}`} />
              {status === "On Time"
                ? "Running on schedule"
                : status === "Recovering"
                ? "Recovering time on current block"
                : `Running ${formatDelay(train.delay)}`}
            </span>
          </div>
        </section>

        {/* Live Platform Advisory */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <Info className="size-4 text-[#1565C0] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">
                Platform Boarding Advisory
              </p>
              <p className="mt-0.5 text-slate-500 leading-relaxed">
                Veta continuous tracking is active. As the train progresses through intermediate signals, this countdown dynamically adjusts. Stay in platform waiting areas until 10 minutes prior to arrival.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setAlertSubscribed(!alertSubscribed)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
                alertSubscribed
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Bell className="size-3.5" />
              {alertSubscribed ? "Alert Active (Simulated SMS)" : "Notify Me 15m Before"}
            </button>

            <span className="text-[11px] text-slate-400">
              Train Speed: {train.speedKmph} km/h
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
