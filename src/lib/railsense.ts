import { useEffect, useState } from "react";

export type Station = {
  code: string;
  name: string;
  /** Scheduled arrival in minutes from route start */
  schedOffset: number;
};

export type TrainDef = {
  id: string;
  number: string;
  name: string;
  from: string;
  to: string;
  /** Departure clock time label of route start */
  startLabel: string;
  stations: Station[];
};

export type TrainState = {
  def: TrainDef;
  /** index of the next station the train is heading to */
  nextIndex: number;
  /** current delay in minutes (can be negative = ahead of schedule) */
  delay: number;
  /** minutes until arrival at next station */
  etaMinutes: number;
  /** 0..1 progress between previous and next station */
  progress: number;
  /** delay history over last checkpoints */
  history: { label: string; delay: number }[];
  weather: string;
  congestion: "Low" | "Moderate" | "High";
};

export type Status = "On Time" | "Minor Delay" | "Delayed" | "Recovering";

const TRAINS: TrainDef[] = [
  {
    id: "12951",
    number: "12951",
    name: "Mumbai Rajdhani Express",
    from: "Mumbai Central",
    to: "New Delhi",
    startLabel: "17:00",
    stations: [
      { code: "BCT", name: "Mumbai Central", schedOffset: 0 },
      { code: "BVI", name: "Borivali", schedOffset: 28 },
      { code: "ST", name: "Surat", schedOffset: 158 },
      { code: "BRC", name: "Vadodara Jn", schedOffset: 245 },
      { code: "RTM", name: "Ratlam Jn", schedOffset: 415 },
      { code: "KOTA", name: "Kota Jn", schedOffset: 585 },
      { code: "NDLS", name: "New Delhi", schedOffset: 930 },
    ],
  },
  {
    id: "12259",
    number: "12259",
    name: "Sealdah Duronto Express",
    from: "Sealdah",
    to: "New Delhi",
    startLabel: "20:05",
    stations: [
      { code: "SDAH", name: "Sealdah", schedOffset: 0 },
      { code: "DHN", name: "Dhanbad Jn", schedOffset: 245 },
      { code: "GAYA", name: "Gaya Jn", schedOffset: 380 },
      { code: "MGS", name: "Mughalsarai Jn", schedOffset: 500 },
      { code: "CNB", name: "Kanpur Central", schedOffset: 730 },
      { code: "NDLS", name: "New Delhi", schedOffset: 1010 },
    ],
  },
  {
    id: "12627",
    number: "12627",
    name: "Karnataka Express",
    from: "KSR Bengaluru",
    to: "New Delhi",
    startLabel: "19:20",
    stations: [
      { code: "SBC", name: "KSR Bengaluru", schedOffset: 0 },
      { code: "DMM", name: "Dharmavaram Jn", schedOffset: 190 },
      { code: "SC", name: "Secunderabad Jn", schedOffset: 480 },
      { code: "BPQ", name: "Balharshah Jn", schedOffset: 700 },
      { code: "NGP", name: "Nagpur Jn", schedOffset: 860 },
      { code: "BPL", name: "Bhopal Jn", schedOffset: 1160 },
      { code: "AGC", name: "Agra Cantt", schedOffset: 1460 },
      { code: "NDLS", name: "New Delhi", schedOffset: 1620 },
    ],
  },
  {
    id: "12002",
    number: "12002",
    name: "Bhopal Shatabdi Express",
    from: "Bhopal Jn",
    to: "New Delhi",
    startLabel: "14:40",
    stations: [
      { code: "BPL", name: "Bhopal Jn", schedOffset: 0 },
      { code: "BINA", name: "Bina Jn", schedOffset: 110 },
      { code: "JHS", name: "Jhansi Jn", schedOffset: 200 },
      { code: "GWL", name: "Gwalior Jn", schedOffset: 260 },
      { code: "AGC", name: "Agra Cantt", schedOffset: 340 },
      { code: "NDLS", name: "New Delhi", schedOffset: 460 },
    ],
  },
  {
    id: "12622",
    number: "12622",
    name: "Tamil Nadu Express",
    from: "MGR Chennai Ctr",
    to: "New Delhi",
    startLabel: "22:00",
    stations: [
      { code: "MAS", name: "MGR Chennai Ctr", schedOffset: 0 },
      { code: "BZA", name: "Vijayawada Jn", schedOffset: 400 },
      { code: "WL", name: "Warangal", schedOffset: 570 },
      { code: "BPQ", name: "Balharshah Jn", schedOffset: 760 },
      { code: "NGP", name: "Nagpur Jn", schedOffset: 930 },
      { code: "JHS", name: "Jhansi Jn", schedOffset: 1310 },
      { code: "NDLS", name: "New Delhi", schedOffset: 1620 },
    ],
  },
];

const WEATHER = ["Clear", "Light rain", "Fog patches", "Heavy rain", "Haze"];
const CONGESTION: TrainState["congestion"][] = ["Low", "Moderate", "High"];

const SEED: { nextIndex: number; delay: number; eta: number; w: number; c: number }[] = [
  { nextIndex: 4, delay: 6, eta: 22, w: 0, c: 1 },
  { nextIndex: 3, delay: 24, eta: 14, w: 3, c: 2 },
  { nextIndex: 5, delay: -2, eta: 31, w: 4, c: 0 },
  { nextIndex: 2, delay: 11, eta: 9, w: 2, c: 1 },
  { nextIndex: 4, delay: 38, eta: 18, w: 1, c: 2 },
];

function initialState(): TrainState[] {
  return TRAINS.map((def, i) => {
    const s = SEED[i]!;
    return {
      def,
      nextIndex: s.nextIndex,
      delay: s.delay,
      etaMinutes: s.eta,
      progress: 0.45,
      weather: WEATHER[s.w]!,
      congestion: CONGESTION[s.c]!,
      history: [-4, -3, -2, -1, 0].map((k, idx) => ({
        label: `T${idx + 1}`,
        delay: Math.max(-5, s.delay + k * 2),
      })),
    };
  });
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function tick(states: TrainState[]): TrainState[] {
  return states.map((t) => {
    const drift = Math.round((Math.random() * 6 - 2.6) * 10) / 10;
    const delay = clamp(Math.round(t.delay + drift), -5, 60);
    let etaMinutes = t.etaMinutes - 1 + Math.round(drift / 2);
    let nextIndex = t.nextIndex;
    let progress = clamp(t.progress + 0.06, 0, 1);
    if (etaMinutes <= 0) {
      nextIndex = Math.min(t.def.stations.length - 1, t.nextIndex + 1);
      const prev = t.def.stations[nextIndex - 1]!;
      const next = t.def.stations[nextIndex]!;
      etaMinutes = Math.max(6, Math.round((next.schedOffset - prev.schedOffset) * 0.4));
      progress = 0.05;
    }
    const history = [...t.history.slice(1), { label: "now", delay }].map((h, i, arr) => ({
      label: i === arr.length - 1 ? "now" : `T${i + 1}`,
      delay: h!.delay,
    }));
    return {
      ...t,
      delay,
      etaMinutes: clamp(etaMinutes, 1, 240),
      nextIndex,
      progress,
      history,
      weather: Math.random() < 0.12 ? WEATHER[Math.floor(Math.random() * WEATHER.length)]! : t.weather,
      congestion:
        Math.random() < 0.12 ? CONGESTION[Math.floor(Math.random() * CONGESTION.length)]! : t.congestion,
    };
  });
}

/** Module-level store shared across pages */
let state: TrainState[] = initialState();
const listeners = new Set<(s: TrainState[]) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function start() {
  if (timer) return;
  timer = setInterval(() => {
    state = tick(state);
    listeners.forEach((l) => l(state));
  }, 3000);
}

export function useLiveTrains() {
  const [trains, setTrains] = useState<TrainState[]>(state);
  useEffect(() => {
    const listener = (s: TrainState[]) => setTrains(s);
    listeners.add(listener);
    setTrains(state);
    start();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);
  return trains;
}

export function statusOf(delay: number, history: { delay: number }[]): Status {
  const earlier = history[0]?.delay ?? delay;
  if (delay <= 3) return "On Time";
  if (delay < earlier - 3) return "Recovering";
  if (delay <= 15) return "Minor Delay";
  return "Delayed";
}

export function statusClasses(status: Status) {
  switch (status) {
    case "On Time":
      return "bg-ontime/12 text-ontime border-ontime/30";
    case "Recovering":
      return "bg-brand/10 text-brand border-brand/30";
    case "Minor Delay":
      return "bg-warn/12 text-warn border-warn/30";
    default:
      return "bg-late/12 text-late border-late/30";
  }
}

export function formatDelay(delay: number) {
  if (delay > 0) return `+${delay} min`;
  if (delay < 0) return `${delay} min`;
  return "On schedule";
}

/** Turn a minute-offset into a clock time string, based on route start label */
export function clockFrom(startLabel: string, offsetMin: number) {
  const [h = 0, m = 0] = startLabel.split(":").map(Number);
  const total = (h * 60 + m + offsetMin) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export const TRAIN_DEFS = TRAINS;
