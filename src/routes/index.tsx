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
import {
  ArrowRight,
  CloudRain,
  Gauge,
  Radio,
  Clock,
  Sparkles,
  Play,
  Pause,
  CloudFog,
  TrafficCone,
  Zap,
  Layers,
  Map as MapIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  ChevronRight,
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
  useCountdownSeconds,
  useSimulationControls,
  Status,
} from "@/lib/veta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Dashboard — Veta Real-Time Indian Railways Predictions" },
      {
        name: "description",
        content:
          "Live Indian Railways train arrival prediction dashboard. Predicted ETAs updating in real-time from position, weather, and congestion.",
      },
      { property: "og:title", content: "Veta — Real-Time Indian Railways ETA Dashboard" },
      {
        property: "og:description",
        content: "Predict. Plan. Arrive Better. Live train arrival dashboard for Indian Railways.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const trains = useLiveTrains();
  const secondsLeft = useCountdownSeconds();
  const { isPaused, togglePause, injectDisruption } = useSimulationControls();

  const [selectedId, setSelectedId] = useState(trains[0]?.def.id ?? "12951");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"cards" | "map" | "split">("split");

  const selected = trains.find((t) => t.def.id === selectedId) ?? trains[0];

  // Filtering trains
  const filteredTrains = trains.filter((t) => {
    const status = statusOf(t.delay, t.history);
    const matchesFilter =
      filterStatus === "ALL" ||
      (filterStatus === "ON_TIME" && status === "On Time") ||
      (filterStatus === "MINOR" && status === "Minor Delay") ||
      (filterStatus === "DELAYED" && status === "Delayed") ||
      (filterStatus === "RECOVERING" && status === "Recovering");

    const matchesSearch =
      t.def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.def.number.includes(searchQuery) ||
      t.def.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.def.to.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800">
      <AppNav />

      {/* Top Hackathon Demo Control Bar */}
      <div className="border-b border-slate-200/80 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="relative flex size-2">
                  <span className={`absolute inline-flex size-full rounded-full bg-emerald-500 ${!isPaused ? "animate-ping opacity-75" : ""}`} />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
                </span>
                {isPaused ? "Live Stream Paused" : `Live ETA Recalculating in ${secondsLeft}s`}
              </span>

              <span className="hidden sm:inline-flex text-xs text-slate-500 font-medium">
                • 5 Superfast/Express Corridors
              </span>
            </div>

            {/* Interactive Simulation Controls for Demo Judges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 hidden md:inline">
                Simulate Conditions:
              </span>

              <button
                onClick={() => injectDisruption("fog")}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                title="Simulate fog speed restrictions (+8 min delay)"
              >
                <CloudFog className="size-3 text-slate-500" /> Fog (+8m)
              </button>

              <button
                onClick={() => injectDisruption("congestion")}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                title="Simulate junction signal congestion (+6 min delay)"
              >
                <TrafficCone className="size-3 text-amber-600" /> Signal Hold (+6m)
              </button>

              <button
                onClick={() => injectDisruption("recovery")}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                title="Simulate clear track speed recovery (-5 min delay)"
              >
                <Zap className="size-3 text-blue-600" /> Clear Track (-5m)
              </button>

              <button
                onClick={togglePause}
                className="inline-flex items-center gap-1 rounded-md border border-[#1F3864]/20 bg-[#1F3864]/5 px-2.5 py-1 text-xs font-semibold text-[#1F3864] hover:bg-[#1F3864]/10 transition-colors"
              >
                {isPaused ? <Play className="size-3" /> : <Pause className="size-3" />}
                {isPaused ? "Resume" : "Pause"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F3864] sm:text-3xl">
                Live Train Arrival Dashboard
              </h1>
              <span className="rounded-md bg-[#1565C0]/10 px-2 py-0.5 text-xs font-semibold text-[#1565C0]">
                Active Feed
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
              Continuous arrival predictions powered by live train velocity, section block congestion, and weather telemetry. Predicted ETAs update automatically.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-2xs self-start md:self-auto">
            <button
              onClick={() => setActiveView("cards")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeView === "cards"
                  ? "bg-[#1F3864] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="size-3.5" /> Train Cards
            </button>
            <button
              onClick={() => setActiveView("split")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeView === "split"
                  ? "bg-[#1F3864] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity className="size-3.5" /> Split View
            </button>
            <button
              onClick={() => setActiveView("map")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeView === "map"
                  ? "bg-[#1F3864] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapIcon className="size-3.5" /> Full Map
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filterStatus === "ALL"
                  ? "bg-[#1F3864] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Trains ({trains.length})
            </button>
            <button
              onClick={() => setFilterStatus("ON_TIME")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filterStatus === "ON_TIME"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" /> On Time
            </button>
            <button
              onClick={() => setFilterStatus("MINOR")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filterStatus === "MINOR"
                  ? "bg-amber-600 text-white"
                  : "text-slate-600 hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <span className="size-1.5 rounded-full bg-amber-500" /> Minor Delay
            </button>
            <button
              onClick={() => setFilterStatus("DELAYED")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filterStatus === "DELAYED"
                  ? "bg-rose-600 text-white"
                  : "text-slate-600 hover:bg-rose-50 hover:text-rose-800"
              }`}
            >
              <span className="size-1.5 rounded-full bg-rose-500" /> Delayed
            </button>
            <button
              onClick={() => setFilterStatus("RECOVERING")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filterStatus === "RECOVERING"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              <span className="size-1.5 rounded-full bg-blue-500" /> Recovering
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search train name or no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#1565C0] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Dashboard Main Grid Layout */}
        <div className="mt-6 space-y-8">
          {/* If Map or Split view is active, show the interactive Corridor Map */}
          {(activeView === "map" || activeView === "split") && (
            <div>
              <RouteMap
                trains={trains}
                selectedTrainId={selected?.def.id}
                onSelectTrain={(id) => setSelectedId(id)}
              />
            </div>
          )}

          {/* Train Cards List (shown in cards or split view) */}
          {activeView !== "map" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#1F3864] flex items-center gap-2">
                  <span>Monitored Indian Railways Express Trains</span>
                  <span className="text-xs font-normal text-slate-500">
                    (Click a card to inspect delay analytics below)
                  </span>
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredTrains.length} of {trains.length}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTrains.map((t) => {
                  const currentStation = t.def.stations[t.nextIndex]!;
                  const prevStation = t.def.stations[Math.max(0, t.nextIndex - 1)]!;
                  const status = statusOf(t.delay, t.history);
                  const isSelected = selected?.def.id === t.def.id;

                  return (
                    <article
                      key={t.def.id}
                      onClick={() => setSelectedId(t.def.id)}
                      className={`relative cursor-pointer rounded-2xl border bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-[#1565C0] ring-2 ring-[#1565C0]/15"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Card Header: Train Info & Status Tag */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#1F3864]/5 px-2 py-0.5 text-xs font-bold text-[#1565C0] tracking-wide">
                              #{t.def.number}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500">
                              {t.def.corridor}
                            </span>
                          </div>
                          <h3 className="mt-1 text-base font-bold text-[#1F3864] leading-snug">
                            {t.def.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 font-medium">
                            {t.def.from} → {t.def.to}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses(
                            status
                          )}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${statusDotClass(status)}`}
                          />
                          {status}
                        </span>
                      </div>

                      {/* Next Station & Predicted Arrival Box */}
                      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                          <span className="flex items-center gap-1 uppercase tracking-wider">
                            Approaching
                          </span>
                          <span className="font-semibold text-slate-700">
                            {currentStation.name} ({currentStation.code})
                          </span>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between">
                          <div>
                            <span className="text-3xl font-extrabold tabular-nums text-[#1F3864]">
                              {t.etaMinutes}
                            </span>
                            <span className="ml-1 text-xs font-semibold text-slate-500">
                              min ETA
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="block text-sm font-bold tabular-nums text-[#1F3864]">
                              {clockFrom(
                                t.def.startLabel,
                                currentStation.schedOffset + t.delay
                              )}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              Sched: {clockFrom(t.def.startLabel, currentStation.schedOffset)}
                            </span>
                          </div>
                        </div>

                        {/* Segment Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                            <span>{prevStation.code}</span>
                            <span>{Math.round(t.progress * 100)}% section block</span>
                            <span>{currentStation.code}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#1565C0] transition-all duration-700"
                              style={{ width: `${Math.round(t.progress * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Conditions Telemetry Chips */}
                      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                        <div>
                          <dt className="text-[11px] text-slate-500">Delay</dt>
                          <dd
                            className={`mt-0.5 font-bold tabular-nums ${
                              t.delay <= 3
                                ? "text-emerald-600"
                                : t.delay <= 15
                                ? "text-amber-600"
                                : "text-rose-600"
                            }`}
                          >
                            {formatDelay(t.delay)}
                          </dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-1 text-[11px] text-slate-500">
                            <CloudRain className="size-3 text-slate-400" /> Weather
                          </dt>
                          <dd className="mt-0.5 font-semibold text-slate-700 truncate" title={t.weather}>
                            {t.weather.split("·")[0]}
                          </dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Gauge className="size-3 text-slate-400" /> Track
                          </dt>
                          <dd className="mt-0.5 font-semibold text-slate-700">
                            {t.congestion} traffic
                          </dd>
                        </div>
                      </dl>

                      {/* Card Footer Link to Train Details */}
                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Speed: <span className="font-semibold text-slate-700">{t.speedKmph} km/h</span>
                        </span>
                        <Link
                          to="/train/$trainId"
                          params={{ trainId: t.def.id }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1565C0] hover:text-[#1F3864] hover:underline"
                        >
                          View full route <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Train Predicted Delay Trend Chart */}
          {selected && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="size-4 text-[#1565C0] animate-pulse" />
                    <h2 className="text-lg font-bold text-[#1F3864]">
                      Predicted Delay Trend & Checkpoint History
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Selected: <span className="font-bold text-slate-700">{selected.def.number} · {selected.def.name}</span> ({selected.def.from} → {selected.def.to})
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current Delay</span>
                    <span className="text-sm font-bold text-[#1F3864]">{formatDelay(selected.delay)}</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current Velocity</span>
                    <span className="text-sm font-bold text-[#1565C0]">{selected.speedKmph} km/h</span>
                  </div>
                  <Link
                    to="/train/$trainId"
                    params={{ trainId: selected.def.id }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F3864] px-3 py-2 text-xs font-medium text-white hover:bg-[#1F3864]/90 transition-colors shadow-2xs"
                  >
                    Station-by-Station Timeline <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* Recharts AreaChart with Live Recalculations */}
              <div className="mt-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={selected.history}
                    margin={{ top: 12, right: 16, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="vetaDelayFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1565C0" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#1565C0" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={{ stroke: "#cbd5e1" }}
                      fontSize={11}
                      tick={{ fill: "#64748b" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={{ stroke: "#cbd5e1" }}
                      fontSize={11}
                      tick={{ fill: "#64748b" }}
                      unit="m"
                    />
                    <Tooltip
                      formatter={(val: number) => [`${val > 0 ? `+${val}` : val} minutes delay`, "Prediction"]}
                      labelFormatter={(lbl) => `Checkpoint: ${lbl}`}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="delay"
                      stroke="#1565C0"
                      strokeWidth={2.5}
                      fill="url(#vetaDelayFill)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-slate-400" />
                  Continuous telemetry recalculation interval: Every 3 seconds
                </span>
                <span className="italic">
                  Model inputs: GPS velocity, weather alerts, block clearance, track density
                </span>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
