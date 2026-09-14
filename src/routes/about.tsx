import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { VetaLogo } from "@/components/VetaLogo";
import {
  CloudRain,
  Gauge,
  History,
  MapPin,
  RefreshCw,
  Sparkles,
  TrainFront,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How Veta Works — Dynamic Train ETA Prediction | Indian Railways" },
      {
        name: "description",
        content:
          "A plain-language explanation of how Veta combines live position, weather conditions, track congestion, and historical patterns into continuously updating Indian Railways arrival times.",
      },
      { property: "og:title", content: "How Veta Works — Predict. Plan. Arrive Better." },
      {
        property: "og:description",
        content: "How live location, weather, track density, and past runs shape dynamic train ETAs.",
      },
    ],
  }),
  component: AboutPage,
});

const inputPillars = [
  {
    icon: MapPin,
    title: "1. Where the train is right now",
    subtitle: "Real-time location and speed",
    body: "Rather than guessing from the timetable, Veta tracks the train's exact live location between stations and measures its actual running speed in kilometers per hour.",
    badge: "GPS & Section Telemetry",
  },
  {
    icon: CloudRain,
    title: "2. Weather along the route",
    subtitle: "Visibility and track conditions",
    body: "Dense winter fog in North India, sudden monsoon downpours, or extreme summer heat require trains to slow down for passenger safety. If bad weather lies ahead, the arrival time adjusts before the delay even occurs.",
    badge: "Weather Radar Alerts",
  },
  {
    icon: Gauge,
    title: "3. How busy the tracks are",
    subtitle: "Signals and junction traffic",
    body: "Trains often get held up outside major stations while waiting for a platform to clear or for another train to cross. Veta analyzes track congestion ahead to foresee signal stops.",
    badge: "Track Congestion Index",
  },
  {
    icon: History,
    title: "4. What usually happens on this stretch",
    subtitle: "Corridor learning and recovery",
    body: "Some rail sections routinely lose minutes due to maintenance, while other wide, straight corridors allow skilled loco pilots to make up lost time. Past journeys tell Veta where trains can recover.",
    badge: "Historical Recovery Profiles",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800">
      <AppNav />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1565C0]/30 bg-[#1565C0]/10 px-3.5 py-1 text-xs font-bold text-[#1565C0]">
              <Sparkles className="size-3.5" /> Smart India Hackathon Concept
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1F3864] sm:text-4xl">
              How Veta Works
            </h1>

            <p className="mt-3 text-lg leading-relaxed text-slate-600 max-w-xl">
              A printed timetable only tells you when a train was <em>supposed</em> to arrive. Veta tells you when it is <strong>actually likely to arrive</strong> — and continuously updates that answer as the journey unfolds on Indian Railways.
            </p>
          </div>

          <VetaLogo className="size-28 sm:size-36 shrink-0 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm self-center sm:self-auto" />
        </div>

        {/* 4 Core Signals Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {inputPillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#1F3864]/5 text-[#1565C0]">
                  <p.icon className="size-5" />
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {p.badge}
                </span>
              </div>

              <h2 className="mt-4 text-base font-bold text-[#1F3864]">{p.title}</h2>
              <p className="text-xs font-semibold text-[#1565C0]">{p.subtitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>

        {/* The Continuous Feedback Loop Callout */}
        <div className="mt-10 rounded-2xl border border-[#1F3864] bg-[#1F3864] p-7 text-white shadow-md">
          <div className="flex items-center gap-2 text-blue-200">
            <RefreshCw className="size-5 animate-spin" style={{ animationDuration: "8s" }} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Continuous Intelligence
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-bold">It Never Stops Updating</h2>
          <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
            Every few seconds, fresh signals from the locomotive and signaling blocks are fed back into the Veta prediction model. If a train runs faster than expected on an open stretch, its predicted arrival moves earlier. If it gets stopped at a signal, the countdown instantly adapts. You always see the most truthful answer available, not an outdated timetable estimate.
          </p>
        </div>

        {/* Comparison Table: Traditional vs Veta */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-[#1F3864]">
            Traditional Timetables vs. Veta Dynamic Predictions
          </h2>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#1F3864]">
                <tr>
                  <th className="p-3.5 font-bold">Feature</th>
                  <th className="p-3.5 font-bold text-slate-500">Traditional Fixed Schedule</th>
                  <th className="p-3.5 font-bold text-[#1565C0]">Veta Live Prediction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3.5 font-semibold text-slate-900">Update Frequency</td>
                  <td className="p-3.5 text-slate-500">Static once published</td>
                  <td className="p-3.5 font-bold text-emerald-700 bg-emerald-50/50">
                    Recalculates every few seconds
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-slate-900">Weather Adaptation</td>
                  <td className="p-3.5 text-slate-500">Ignores fog, rain & heat</td>
                  <td className="p-3.5 font-bold text-emerald-700 bg-emerald-50/50">
                    Pre-factors visibility & speed restrictions
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-slate-900">Track Congestion</td>
                  <td className="p-3.5 text-slate-500">No visibility into line traffic</td>
                  <td className="p-3.5 font-bold text-emerald-700 bg-emerald-50/50">
                    Anticipates junction & platform holds
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-slate-900">Passenger Experience</td>
                  <td className="p-3.5 text-slate-500">Overcrowded platforms & anxiety</td>
                  <td className="p-3.5 font-bold text-emerald-700 bg-emerald-50/50">
                    Plan exact departure; arrive peacefully
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Tags Explanation */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-bold text-[#1F3864]">What the Status Badges Mean</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
              <span className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <span className="font-bold text-emerald-800">On Time</span>
                <p className="mt-0.5 text-slate-600">
                  Expected within 3 minutes of the scheduled timetable.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
              <span className="size-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <span className="font-bold text-amber-800">Minor Delay</span>
                <p className="mt-0.5 text-slate-600">
                  Running 4 to 15 minutes late; manageable for most connecting commuters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/60 p-3">
              <span className="size-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <div>
                <span className="font-bold text-rose-800">Delayed</span>
                <p className="mt-0.5 text-slate-600">
                  More than 15 minutes behind schedule. Passengers are advised to plan for the new ETA.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3">
              <span className="size-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div>
                <span className="font-bold text-blue-800">Recovering</span>
                <p className="mt-0.5 text-slate-600">
                  Currently running late, but actively clawing back lost minutes on an open stretch.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prototype & Hackathon Notice */}
        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-100/80 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Smart India Hackathon Prototype Notice:</p>
          <p className="mt-1 leading-relaxed">
            This application demonstrates how continuous predictive ETAs can replace static railway schedules using simulated Indian Railways express routes (Mumbai Rajdhani, Sealdah Duronto, Karnataka Express, Bhopal Shatabdi, and Tamil Nadu Express). No external API key is required for this stand-alone prototype demonstration.
          </p>
        </div>
      </main>
    </div>
  );
}
