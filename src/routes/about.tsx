import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { CloudRain, Gauge, History, MapPin, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How RailSense Works — Live Train ETA Prediction" },
      {
        name: "description",
        content:
          "A plain-language explanation of how RailSense combines live position, weather, track congestion and past patterns into a constantly updating train arrival time.",
      },
      { property: "og:title", content: "How RailSense Works" },
      {
        property: "og:description",
        content: "How live position, weather, congestion and history shape a constantly updating train ETA.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const inputs = [
  {
    icon: MapPin,
    title: "Where the train is right now",
    body: "We keep track of the train's latest position along its route and how fast it is moving between stations.",
  },
  {
    icon: CloudRain,
    title: "Weather along the route",
    body: "Fog, heavy rain or a heatwave slow trains down. If bad weather is ahead, the arrival time is pushed back accordingly.",
  },
  {
    icon: Gauge,
    title: "How busy the track is",
    body: "A train often waits because another train is on the same line. We factor in how crowded the upcoming stretch of track is.",
  },
  {
    icon: History,
    title: "What usually happens here",
    body: "Some sections routinely lose time, others let trains make it up. Past journeys on the same route tell us which is which.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">How RailSense works</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          A printed timetable tells you when a train was <em>supposed</em> to arrive. RailSense tells you when
          it is actually likely to arrive — and keeps changing that answer as the journey unfolds.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {inputs.map((i) => (
            <div key={i.title} className="rounded-xl border border-border bg-surface p-5 shadow-card">
              <i.icon className="size-5 text-brand" />
              <h2 className="mt-3 text-base font-semibold text-navy">{i.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-navy/15 bg-navy p-6 text-primary-foreground shadow-card">
          <RefreshCw className="size-5" />
          <h2 className="mt-3 text-xl font-semibold">It never stops updating</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-90">
            Every few seconds these four signals are fed back into the prediction model. If the train makes up
            time on a clear stretch, the arrival time moves earlier. If it gets held at a signal, it moves
            later. You always see the newest answer, not a guess made hours ago.
          </p>
        </div>

        <h2 className="mt-12 text-xl font-semibold text-navy">What the status tags mean</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-ontime">On Time</span> — expected within a few minutes of the
            timetable.
          </li>
          <li>
            <span className="font-semibold text-warn">Minor Delay</span> — running late, but by an amount most
            passengers can absorb.
          </li>
          <li>
            <span className="font-semibold text-late">Delayed</span> — significantly behind schedule; plan for
            the new arrival time.
          </li>
          <li>
            <span className="font-semibold text-brand">Recovering</span> — still late, but actively making up
            time on the current stretch.
          </li>
        </ul>

        <p className="mt-12 rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
          Prototype note: this demonstration runs on realistic simulated data rather than a live railway feed,
          so the concept can be shown end to end without external systems.
        </p>
      </main>
    </div>
  );
}
