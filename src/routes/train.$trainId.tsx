import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CloudRain,
  Gauge,
  TrainFront,
  Clock,
  Navigation,
  Activity,
  AlertCircle,
  Zap,
  CheckCircle2,
  Calendar,
  Radio,
  ExternalLink,
} from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { RouteMap } from "@/components/RouteMap";
import {
  clockFrom,
  formatDelay,
  statusClasses,
  statusDotClass,
  statusOf,
  useLiveTrains,
  calculateEtaForStation,
} from "@/lib/veta";

export const Route = createFileRoute("/train/$trainId")({
  head: () => ({
    meta: [
      { title: "Train Route & Station-by-Station Timeline — Veta" },
      {
        name: "description",
        content:
          "Station-by-station predicted arrival times for Indian Railways trains, with scheduled times, live predictions, and differences at every stop.",
      },
      { property: "og:title", content: "Veta — Train Route & Predicted Arrivals" },
      {
        property: "og:description",
        content: "Scheduled vs live predicted arrival at every station on the route.",
      },
    ],
  }),
  component: TrainDetail,
});

function TrainDetail() {
  const { trainId } = Route.useParams();
  const trains = useLiveTrains();
  const train = trains.find((t) => t.def.id === trainId) ?? trains[0];
  const [showMap, setShowMap] = useState(false);

  if (!train) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <AppNav />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
            <TrainFront className="size-6" />
          </div>
          <h1 className="text-xl font-bold text-[#1F3864]">Train not found</h1>
          <p className="mt-1 text-sm text-slate-500">
            The requested train ID does not exist in our active corridor monitoring.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#1F3864] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1F3864]/90"
          >
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  const status = statusOf(train.delay, train.history);
  const stations = train.def.stations;
  const nextStation = stations[train.nextIndex]!;
  const prevStation = stations[Math.max(0, train.nextIndex - 1)]!;

  // Overall journey percentage
  const totalStations = stations.length;
  const overallProgress = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((train.nextIndex - 1 + train.progress) / Math.max(1, totalStations - 1)) * 100
      )
    )
  );

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800">
      <AppNav />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1565C0] transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Live Dashboard
          </Link>

          <Link
            to="/passenger"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1565C0] hover:underline"
          >
            Open Passenger View <ExternalLink className="size-3" />
          </Link>
        </div>

        {/* Train Overview Header Card */}
        <header className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#1F3864]/5 px-2 py-0.5 text-xs font-bold text-[#1565C0]">
                  #{train.def.number}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {train.def.corridor}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Updating
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1F3864] sm:text-3xl">
                {train.def.name}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {train.def.from} ({stations[0]!.code}) → {train.def.to} (
                {stations[stations.length - 1]!.code}) · Origin Departed: {train.def.startLabel}
              </p>
            </div>

            <span
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusClasses(
                status
              )}`}
            >
              <span className={`size-2 rounded-full ${statusDotClass(status)}`} />
              {status}
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current Delay</span>
              <span
                className={`text-lg font-bold tabular-nums block mt-0.5 ${
                  train.delay <= 3
                    ? "text-emerald-600"
                    : train.delay <= 15
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}
              >
                {formatDelay(train.delay)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Next Station ETA</span>
              <span className="text-lg font-bold text-[#1F3864] block mt-0.5 tabular-nums">
                {train.etaMinutes} min ({nextStation.code})
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current Speed</span>
              <span className="text-lg font-bold text-[#1565C0] block mt-0.5 tabular-nums">
                {train.speedKmph} km/h
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Track Congestion</span>
              <span className="text-lg font-bold text-slate-700 block mt-0.5">
                {train.congestion} ({train.weather.split("·")[0]})
              </span>
            </div>
          </div>

          {/* Route Progress Visual Line */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <TrainFront className="size-4 text-[#1565C0]" /> Position Along Corridor
              </span>
              <span className="text-slate-500">{overallProgress}% of route completed</span>
            </div>

            <div className="relative mt-4">
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#1F3864] to-[#1565C0] transition-all duration-700"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              {/* Locomotive Pin on Progress Bar */}
              <div
                className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center transition-all duration-700"
                style={{ left: `${overallProgress}%` }}
              >
                <div className="size-7 rounded-full bg-white border-2 border-[#1565C0] flex items-center justify-center shadow-md text-[#1565C0]">
                  <TrainFront className="size-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-between text-[11px] font-medium text-slate-500">
              <span>{stations[0]!.name} ({stations[0]!.code})</span>
              <span className="font-bold text-[#1565C0]">
                Now between {prevStation.code} & {nextStation.code}
              </span>
              <span>{stations[stations.length - 1]!.name} ({stations[stations.length - 1]!.code})</span>
            </div>

            {/* Toggle Corridor Map View */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowMap(!showMap)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1565C0] hover:text-[#1F3864]"
              >
                <Navigation className="size-3.5" />
                {showMap ? "Hide Corridor Schematic Map" : "Show Corridor Schematic Map"}
              </button>
            </div>
          </div>
        </header>

        {/* Optional Corridor Map for this specific train */}
        {showMap && (
          <div className="mt-6">
            <RouteMap
              trains={trains}
              selectedTrainId={train.def.id}
              focusedTrainId={train.def.id}
            />
          </div>
        )}

        {/* Dynamic Prediction Breakdown Card */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50/50 p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[#1565C0]" />
            <h2 className="text-sm font-bold text-[#1F3864] uppercase tracking-wider">
              Veta Dynamic Prediction Factors
            </h2>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3">
              <span className="font-semibold text-slate-700 block">Section Block Velocity</span>
              <p className="mt-1 text-slate-500 leading-relaxed">
                Telemetry indicates train running at {train.speedKmph} km/h on clear signaling block.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-3">
              <span className="font-semibold text-slate-700 block">Weather Buffering</span>
              <p className="mt-1 text-slate-500 leading-relaxed">
                Current local condition: {train.weather}. {train.weather.includes("Fog") ? "Speed restricted by safety rules." : "Optimal visibility window."}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-3">
              <span className="font-semibold text-slate-700 block">Line Traffic & Recovery</span>
              <p className="mt-1 text-slate-500 leading-relaxed">
                {train.congestion} track congestion factor. {train.delay > 0 ? "Model projecting partial recovery on next high-speed section." : "Maintaining scheduled timetable pace."}
              </p>
            </div>
          </div>
        </section>

        {/* Station Timeline */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1F3864]">Full Station Route Timeline</h2>
              <p className="text-xs text-slate-500">
                Scheduled timetable vs live model predictions at every junction and halt.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {stations.length} Scheduled Stops
            </span>
          </div>

          <ol className="mt-6 space-y-0">
            {stations.map((station, idx) => {
              const isPassed = idx < train.nextIndex;
              const isNext = idx === train.nextIndex;
              const isUpcoming = idx > train.nextIndex;

              // Calculated delay difference for each station
              const appliedDiff = isPassed ? Math.max(0, Math.round(train.delay * 0.6)) : train.delay;
              const predictedClock = clockFrom(
                train.def.startLabel,
                station.schedOffset + appliedDiff
              );
              const scheduledClock = clockFrom(train.def.startLabel, station.schedOffset);
              const etaMinutesToStation = calculateEtaForStation(train, idx);

              return (
                <li key={station.code} className="relative flex gap-4 pb-6 last:pb-0 group">
                  {/* Timeline Bar Line & Node Indicator */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`z-10 mt-1 size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isNext
                          ? "border-[#1565C0] bg-[#1565C0] text-white ring-4 ring-[#1565C0]/20"
                          : isPassed
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="size-3" />
                      ) : isNext ? (
                        <span className="size-2 rounded-full bg-white animate-ping" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-slate-300" />
                      )}
                    </span>
                    {idx < stations.length - 1 && (
                      <span
                        className={`w-0.5 flex-1 ${
                          isPassed ? "bg-emerald-500" : isNext ? "bg-[#1565C0]" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* Station Information Card */}
                  <div
                    className={`flex-1 rounded-xl border p-4 transition-all duration-200 ${
                      isNext
                        ? "border-[#1565C0] bg-blue-50/40 shadow-xs ring-1 ring-[#1565C0]/15"
                        : isPassed
                        ? "border-slate-200 bg-slate-50/50 opacity-80"
                        : "border-slate-200 bg-white shadow-2xs"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#1F3864] text-base">
                            {station.name}
                          </h3>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                            {station.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Stop #{idx + 1} of {stations.length} · {station.schedOffset} min from origin
                        </p>
                      </div>

                      {isNext ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#1565C0] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs">
                          <span className="size-1.5 rounded-full bg-white animate-pulse" />
                          Approaching Next Stop ({train.etaMinutes}m ETA)
                        </span>
                      ) : isPassed ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          Departed
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">
                          ETA in ~{etaMinutesToStation} min
                        </span>
                      )}
                    </div>

                    {/* Scheduled vs Predicted vs Difference Comparison Grid */}
                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Scheduled Time</span>
                        <span className="font-bold tabular-nums text-slate-700 block mt-0.5">
                          {scheduledClock}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">
                          {isPassed ? "Actual Arrival" : "Veta Predicted ETA"}
                        </span>
                        <span className="font-bold tabular-nums text-[#1F3864] block mt-0.5">
                          {predictedClock}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">Variance</span>
                        <span
                          className={`font-bold tabular-nums block mt-0.5 ${
                            appliedDiff <= 3
                              ? "text-emerald-600"
                              : appliedDiff <= 15
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {appliedDiff > 0 ? `+${appliedDiff} min` : appliedDiff === 0 ? "On Time" : `${appliedDiff} min`}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
    </div>
  );
}
