import { TrainState, statusClasses, statusOf } from "@/lib/veta";
import { TrainFront, Radio, Navigation, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";

// Geographic schematic node positions (relative 500x500 coordinate grid)
const STATIONS_GEO: Record<string, { x: number; y: number; label: string }> = {
  NDLS: { x: 230, y: 85, label: "New Delhi" },
  MMCT: { x: 95, y: 285, label: "Mumbai Central" },
  BVI: { x: 100, y: 270, label: "Borivali" },
  ST: { x: 110, y: 235, label: "Surat" },
  BRC: { x: 120, y: 205, label: "Vadodara" },
  RTM: { x: 155, y: 175, label: "Ratlam" },
  KOTA: { x: 185, y: 135, label: "Kota" },
  SDAH: { x: 420, y: 220, label: "Sealdah" },
  DHN: { x: 375, y: 195, label: "Dhanbad" },
  GAYA: { x: 345, y: 180, label: "Gaya" },
  DDU: { x: 310, y: 165, label: "Pt. Deen Dayal" },
  CNB: { x: 270, y: 145, label: "Kanpur" },
  SBC: { x: 195, y: 425, label: "Bengaluru" },
  DMM: { x: 205, y: 380, label: "Dharmavaram" },
  SC: { x: 215, y: 300, label: "Secunderabad" },
  BPQ: { x: 230, y: 260, label: "Balharshah" },
  NGP: { x: 235, y: 225, label: "Nagpur" },
  BPL: { x: 205, y: 200, label: "Bhopal" },
  BINA: { x: 215, y: 170, label: "Bina" },
  VGLJ: { x: 225, y: 145, label: "Jhansi" },
  GWL: { x: 225, y: 125, label: "Gwalior" },
  AGC: { x: 230, y: 108, label: "Agra" },
  MAS: { x: 265, y: 405, label: "Chennai" },
  BZA: { x: 275, y: 330, label: "Vijayawada" },
  WL: { x: 250, y: 295, label: "Warangal" },
};

interface RouteMapProps {
  trains: TrainState[];
  selectedTrainId?: string;
  onSelectTrain?: (id: string) => void;
  focusedTrainId?: string;
}

export function RouteMap({
  trains,
  selectedTrainId,
  onSelectTrain,
  focusedTrainId,
}: RouteMapProps) {
  // Compute interpolated train coordinate along its route
  const getTrainCoord = (train: TrainState) => {
    const stations = train.def.stations;
    const prevStation = stations[Math.max(0, train.nextIndex - 1)]!;
    const nextStation = stations[train.nextIndex]!;

    const prevCoord = STATIONS_GEO[prevStation.code] || { x: 250, y: 250 };
    const nextCoord = STATIONS_GEO[nextStation.code] || { x: 250, y: 250 };

    const t = Math.min(1, Math.max(0, train.progress));
    const x = prevCoord.x + (nextCoord.x - prevCoord.x) * t;
    const y = prevCoord.y + (nextCoord.y - prevCoord.y) * t;

    return { x, y, prevStation, nextStation };
  };

  const displayedTrains = focusedTrainId
    ? trains.filter((t) => t.def.id === focusedTrainId)
    : trains;

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Navigation className="size-4 text-[#1565C0]" />
          <h3 className="text-sm font-semibold text-[#1F3864]">
            {focusedTrainId ? "Live Corridor Telemetry Track" : "Indian Railways Live Corridor Map"}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" /> On Time
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" /> Minor Delay
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-rose-500" /> Delayed
          </span>
        </div>
      </div>

      <div className="relative mt-2 w-full aspect-4/3 sm:aspect-16/10 bg-slate-50/70 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
        <svg
          viewBox="0 0 500 480"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ambient India Outline or subtle boundary */}
            <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1565C0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1F3864" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Background gridlines for telemetry look */}
          <g opacity="0.15">
            {[80, 160, 240, 320, 400].map((y) => (
              <line key={`h-${y}`} x1="40" y1={y} x2="460" y2={y} stroke="#64748b" strokeWidth="0.5" strokeDasharray="3 6" />
            ))}
            {[100, 200, 300, 400].map((x) => (
              <line key={`v-${x}`} x1={x} y1="40" x2={x} y2="440" stroke="#64748b" strokeWidth="0.5" strokeDasharray="3 6" />
            ))}
          </g>

          {/* Indian Railway Corridor Tracks */}
          {trains.map((train) => {
            const isSelected = train.def.id === selectedTrainId;
            const points = train.def.stations
              .map((s) => STATIONS_GEO[s.code])
              .filter(Boolean)
              .map((pos) => `${pos!.x},${pos!.y}`)
              .join(" ");

            return (
              <g key={`track-${train.def.id}`}>
                {/* Outer shadow / active glow track */}
                <polyline
                  points={points}
                  fill="none"
                  stroke={isSelected ? "#1565C0" : "#cbd5e1"}
                  strokeWidth={isSelected ? 3.5 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isSelected ? 0.9 : 0.6}
                />
                {/* Inner railway track dashes */}
                <polyline
                  points={points}
                  fill="none"
                  stroke={isSelected ? "#ffffff" : "#94a3b8"}
                  strokeWidth={isSelected ? 1.5 : 1}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  opacity={isSelected ? 0.9 : 0.5}
                />
              </g>
            );
          })}

          {/* Station Markers */}
          {Object.entries(STATIONS_GEO).map(([code, pos]) => {
            const isMajorHub = ["NDLS", "MMCT", "SDAH", "SBC", "MAS", "BPL"].includes(code);
            return (
              <g key={`st-${code}`} className="station-node">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isMajorHub ? 5 : 3}
                  fill={isMajorHub ? "#1F3864" : "#ffffff"}
                  stroke="#1565C0"
                  strokeWidth={isMajorHub ? 2 : 1.5}
                />
                {isMajorHub && (
                  <text
                    x={pos.x}
                    y={pos.y - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#1F3864"
                    className="select-none pointer-events-none drop-shadow-xs"
                  >
                    {pos.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active Animated Train Pins */}
          {displayedTrains.map((train) => {
            const { x, y, nextStation } = getTrainCoord(train);
            const isSelected = train.def.id === selectedTrainId;
            const status = statusOf(train.delay, train.history);
            const statusColor =
              status === "On Time"
                ? "#10B981"
                : status === "Recovering"
                ? "#3B82F6"
                : status === "Minor Delay"
                ? "#F59E0B"
                : "#EF4444";

            return (
              <g
                key={`train-pin-${train.def.id}`}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-all duration-700 ease-out"
                onClick={() => onSelectTrain?.(train.def.id)}
                filter="url(#glow)"
              >
                {/* Radar pulse around train */}
                <circle cx="0" cy="0" r={isSelected ? 16 : 11} fill={statusColor} opacity="0.2">
                  <animate
                    attributeName="r"
                    values={isSelected ? "12;20;12" : "9;15;9"}
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0.05;0.3"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Train marker base pin */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 9 : 7}
                  fill="#1F3864"
                  stroke={statusColor}
                  strokeWidth={isSelected ? 2.5 : 2}
                />

                {/* Tiny train dot */}
                <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />

                {/* Information Callout Box for Selected or All */}
                {(isSelected || !focusedTrainId) && (
                  <g transform={`translate(${x > 320 ? -85 : 12}, ${y > 380 ? -28 : -8})`}>
                    <rect
                      x="0"
                      y="0"
                      width={isSelected ? 96 : 82}
                      height={isSelected ? 34 : 26}
                      rx="6"
                      fill="#1F3864"
                      opacity="0.95"
                      stroke={isSelected ? "#60A5FA" : "#334155"}
                      strokeWidth="1"
                    />
                    <text x="6" y={isSelected ? 13 : 11} fontSize={isSelected ? "8.5" : "7.5"} fontWeight="700" fill="#FFFFFF">
                      {train.def.number} · {train.etaMinutes}m
                    </text>
                    <text x="6" y={isSelected ? 25 : 20} fontSize={isSelected ? "7.5" : "6.5"} fill="#93C5FD">
                      → {nextStation.code} ({train.delay > 0 ? `+${train.delay}m` : "On Time"})
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Overlay Legend / Train Quick selector on Map */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/90 backdrop-blur px-3 py-1.5 border border-slate-200 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Radio className="size-3.5 text-[#1565C0] animate-pulse" />
            Live Positions: {trains.length} Express Trains
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {trains.map((t) => {
              const isSelected = t.def.id === selectedTrainId;
              return (
                <button
                  key={t.def.id}
                  onClick={() => onSelectTrain?.(t.def.id)}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                    isSelected
                      ? "bg-[#1F3864] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.def.number}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
