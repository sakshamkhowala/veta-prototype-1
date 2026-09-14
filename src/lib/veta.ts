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
  corridor: string;
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
  history: { label: string; delay: number; reason?: string }[];
  weather: string;
  congestion: "Low" | "Moderate" | "High";
  speedKmph: number;
  lastCheckpointTime: string;
};

export type Status = "On Time" | "Minor Delay" | "Delayed" | "Recovering";

export const TRAINS: TrainDef[] = [
  {
    id: "12951",
    number: "12951",
    name: "Mumbai Rajdhani Express",
    from: "Mumbai Central",
    to: "New Delhi",
    startLabel: "17:00",
    corridor: "Western Trunk Corridor",
    stations: [
      { code: "MMCT", name: "Mumbai Central", schedOffset: 0 },
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
    corridor: "Eastern Grand Chord",
    stations: [
      { code: "SDAH", name: "Sealdah", schedOffset: 0 },
      { code: "DHN", name: "Dhanbad Jn", schedOffset: 245 },
      { code: "GAYA", name: "Gaya Jn", schedOffset: 380 },
      { code: "DDU", name: "Pt. Deen Dayal Upadhyaya Jn", schedOffset: 500 },
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
    corridor: "South-North Spine",
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
    corridor: "Central High Speed Track",
    stations: [
      { code: "BPL", name: "Bhopal Jn", schedOffset: 0 },
      { code: "BINA", name: "Bina Jn", schedOffset: 110 },
      { code: "VGLJ", name: "VGL Jhansi Jn", schedOffset: 200 },
      { code: "GWL", name: "Gwalior Jn", schedOffset: 260 },
      { code: "AGC", name: "Agra Cantt", schedOffset: 340 },
      { code: "NDLS", name: "New Delhi", schedOffset: 460 },
    ],
  },
  {
    id: "12622",
    number: "12622",
    name: "Tamil Nadu Express",
    from: "MGR Chennai Central",
    to: "New Delhi",
    startLabel: "22:00",
    corridor: "Grand Trunk Corridor",
    stations: [
      { code: "MAS", name: "MGR Chennai Central", schedOffset: 0 },
      { code: "BZA", name: "Vijayawada Jn", schedOffset: 400 },
      { code: "WL", name: "Warangal", schedOffset: 570 },
      { code: "BPQ", name: "Balharshah Jn", schedOffset: 760 },
      { code: "NGP", name: "Nagpur Jn", schedOffset: 930 },
      { code: "VGLJ", name: "VGL Jhansi Jn", schedOffset: 1310 },
      { code: "NDLS", name: "New Delhi", schedOffset: 1620 },
    ],
  },
];

const WEATHER_OPTIONS = [
  "Clear Sky · 28°C",
  "Dense Fog Patches · 14°C",
  "Light Drizzle · 24°C",
  "Monsoon Shower · 22°C",
  "Moderate Haze · 26°C",
  "Clear High Visibility · 30°C",
];

const CONGESTION_OPTIONS: TrainState["congestion"][] = ["Low", "Moderate", "High"];

const INITIAL_SEEDS: {
  nextIndex: number;
  delay: number;
  eta: number;
  weatherIdx: number;
  congestionIdx: number;
  speed: number;
}[] = [
  { nextIndex: 4, delay: 6, eta: 18, weatherIdx: 0, congestionIdx: 1, speed: 118 }, // Mumbai Rajdhani
  { nextIndex: 3, delay: 24, eta: 14, weatherIdx: 1, congestionIdx: 2, speed: 82 },  // Sealdah Duronto
  { nextIndex: 5, delay: -2, eta: 32, weatherIdx: 5, congestionIdx: 0, speed: 124 }, // Karnataka Exp
  { nextIndex: 2, delay: 11, eta: 9, weatherIdx: 4, congestionIdx: 1, speed: 105 },  // Bhopal Shatabdi
  { nextIndex: 4, delay: 35, eta: 22, weatherIdx: 3, congestionIdx: 2, speed: 76 },  // Tamil Nadu Exp
];

function createInitialStates(): TrainState[] {
  return TRAINS.map((def, i) => {
    const seed = INITIAL_SEEDS[i]!;
    const delay = seed.delay;
    const history = [-4, -3, -2, -1, 0].map((step, idx) => {
      const historicalDelay = Math.max(-5, delay + step * 2 + (idx % 2 === 0 ? 1 : -1));
      return {
        label: idx === 4 ? "Live" : `CP-${4 - idx}`,
        delay: historicalDelay,
        reason: idx === 4 ? "Active telemetry" : "Section checkpoint pass",
      };
    });

    return {
      def,
      nextIndex: seed.nextIndex,
      delay,
      etaMinutes: seed.eta,
      progress: 0.48,
      weather: WEATHER_OPTIONS[seed.weatherIdx]!,
      congestion: CONGESTION_OPTIONS[seed.congestionIdx]!,
      speedKmph: seed.speed,
      lastCheckpointTime: "Just now",
      history,
    };
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function tickStates(states: TrainState[]): TrainState[] {
  return states.map((t) => {
    // Randomized small realistic drift (-2.0 to +2.5 minutes)
    const drift = Math.round((Math.random() * 4.5 - 2.0) * 10) / 10;
    const newDelay = clamp(Math.round(t.delay + drift * 0.4), -5, 65);

    let etaMinutes = t.etaMinutes - 1;
    let nextIndex = t.nextIndex;
    let progress = clamp(t.progress + 0.045, 0, 1);

    if (etaMinutes <= 0) {
      // Arrived at next station, shift to subsequent stop
      nextIndex = Math.min(t.def.stations.length - 1, t.nextIndex + 1);
      const prevStation = t.def.stations[nextIndex - 1]!;
      const currentStation = t.def.stations[nextIndex]!;
      const segmentSpan = Math.max(20, currentStation.schedOffset - prevStation.schedOffset);
      etaMinutes = Math.max(8, Math.round(segmentSpan * 0.45));
      progress = 0.06;
    }

    // Adjust speed according to congestion & delay
    let speedKmph = t.speedKmph;
    if (t.congestion === "High") {
      speedKmph = clamp(speedKmph - Math.floor(Math.random() * 5), 65, 90);
    } else if (t.congestion === "Low") {
      speedKmph = clamp(speedKmph + Math.floor(Math.random() * 4), 110, 130);
    } else {
      speedKmph = clamp(speedKmph + (Math.random() > 0.5 ? 2 : -2), 90, 115);
    }

    // Keep rolling history of last 5 checkpoints
    const updatedHistory = [...t.history.slice(1), { label: "Live", delay: newDelay }].map((item, idx, arr) => ({
      label: idx === arr.length - 1 ? "Live" : `CP-${arr.length - 1 - idx}`,
      delay: item.delay,
      reason: idx === arr.length - 1 ? "Live model update" : item.reason,
    }));

    return {
      ...t,
      delay: newDelay,
      etaMinutes: clamp(etaMinutes, 1, 240),
      nextIndex,
      progress,
      speedKmph,
      history: updatedHistory,
      lastCheckpointTime: "Seconds ago",
      weather:
        Math.random() < 0.08
          ? WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)]!
          : t.weather,
      congestion:
        Math.random() < 0.08
          ? CONGESTION_OPTIONS[Math.floor(Math.random() * CONGESTION_OPTIONS.length)]!
          : t.congestion,
    };
  });
}

// Global state singleton for real-time reactivity across navigation
let currentStates: TrainState[] = createInitialStates();
const activeListeners = new Set<(states: TrainState[]) => void>();
let simulationInterval: ReturnType<typeof setInterval> | null = null;
let isSimulationPaused = false;
let nextTickSecondsRemaining = 3;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
const countdownListeners = new Set<(sec: number) => void>();

function notifyAll() {
  activeListeners.forEach((fn) => fn([...currentStates]));
}

function notifyCountdown() {
  countdownListeners.forEach((fn) => fn(nextTickSecondsRemaining));
}

function startEngine() {
  if (simulationInterval) return;

  countdownInterval = setInterval(() => {
    if (!isSimulationPaused) {
      nextTickSecondsRemaining = nextTickSecondsRemaining <= 1 ? 3 : nextTickSecondsRemaining - 1;
      notifyCountdown();
    }
  }, 1000);

  simulationInterval = setInterval(() => {
    if (!isSimulationPaused) {
      currentStates = tickStates(currentStates);
      nextTickSecondsRemaining = 3;
      notifyCountdown();
      notifyAll();
    }
  }, 3000);
}

export function useLiveTrains() {
  const [trains, setTrains] = useState<TrainState[]>(currentStates);

  useEffect(() => {
    const listener = (states: TrainState[]) => setTrains(states);
    activeListeners.add(listener);
    setTrains([...currentStates]);
    startEngine();

    return () => {
      activeListeners.delete(listener);
      if (activeListeners.size === 0 && simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }
    };
  }, []);

  return trains;
}

export function useCountdownSeconds() {
  const [sec, setSec] = useState<number>(nextTickSecondsRemaining);

  useEffect(() => {
    const listener = (s: number) => setSec(s);
    countdownListeners.add(listener);
    setSec(nextTickSecondsRemaining);
    startEngine();

    return () => {
      countdownListeners.delete(listener);
    };
  }, []);

  return sec;
}

export function useSimulationControls() {
  const [isPaused, setIsPaused] = useState<boolean>(isSimulationPaused);

  const togglePause = () => {
    isSimulationPaused = !isSimulationPaused;
    setIsPaused(isSimulationPaused);
  };

  const injectDisruption = (type: "fog" | "congestion" | "recovery" | "random") => {
    currentStates = currentStates.map((train) => {
      let delayDelta = 0;
      let weather = train.weather;
      let congestion = train.congestion;
      let speedKmph = train.speedKmph;

      if (type === "fog") {
        delayDelta = 8;
        weather = "Dense Fog Patches · 11°C";
        speedKmph = 65;
      } else if (type === "congestion") {
        delayDelta = 6;
        congestion = "High";
        speedKmph = 75;
      } else if (type === "recovery") {
        delayDelta = -5;
        congestion = "Low";
        weather = "Clear High Visibility · 29°C";
        speedKmph = 125;
      } else {
        delayDelta = Math.floor(Math.random() * 10) - 4;
      }

      const newDelay = clamp(train.delay + delayDelta, -5, 65);
      const newEta = clamp(train.etaMinutes + Math.round(delayDelta / 2), 2, 240);

      const history = [...train.history.slice(1), { label: "Live", delay: newDelay }].map((h, i, arr) => ({
        label: i === arr.length - 1 ? "Live" : `CP-${arr.length - 1 - i}`,
        delay: h.delay,
      }));

      return {
        ...train,
        delay: newDelay,
        etaMinutes: newEta,
        weather,
        congestion,
        speedKmph,
        history,
      };
    });

    notifyAll();
  };

  return {
    isPaused,
    togglePause,
    injectDisruption,
  };
}

export function statusOf(delay: number, history: { delay: number }[]): Status {
  const initialDelay = history[0]?.delay ?? delay;
  if (delay <= 3) return "On Time";
  if (delay < initialDelay - 3) return "Recovering";
  if (delay <= 15) return "Minor Delay";
  return "Delayed";
}

export function statusClasses(status: Status) {
  switch (status) {
    case "On Time":
      return "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "Recovering":
      return "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "Minor Delay":
      return "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    default:
      return "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
  }
}

export function statusDotClass(status: Status) {
  switch (status) {
    case "On Time":
      return "bg-emerald-500";
    case "Recovering":
      return "bg-blue-500";
    case "Minor Delay":
      return "bg-amber-500";
    default:
      return "bg-rose-500";
  }
}

export function formatDelay(delay: number): string {
  if (delay > 0) return `+${delay} min`;
  if (delay < 0) return `${delay} min (Ahead)`;
  return "On schedule";
}

export function clockFrom(startLabel: string, offsetMin: number): string {
  const [hours = 0, mins = 0] = startLabel.split(":").map(Number);
  const totalMins = (hours * 60 + mins + offsetMin) % (24 * 60);
  const normalizedMins = (totalMins + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(normalizedMins / 60)).padStart(2, "0");
  const mm = String(normalizedMins % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function calculateEtaForStation(train: TrainState, targetStationIndex: number): number {
  if (targetStationIndex < train.nextIndex) return 0;
  if (targetStationIndex === train.nextIndex) return train.etaMinutes;

  const nextStation = train.def.stations[train.nextIndex]!;
  const targetStation = train.def.stations[targetStationIndex]!;
  const remainingOffset = targetStation.schedOffset - nextStation.schedOffset;

  return Math.max(train.etaMinutes + 5, train.etaMinutes + remainingOffset);
}

export const TRAIN_DEFS = TRAINS;
