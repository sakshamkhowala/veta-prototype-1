import { Link } from "@tanstack/react-router";
import { TrainFront } from "lucide-react";

const links = [
  { to: "/", label: "Live Dashboard" },
  { to: "/passenger", label: "Passenger View" },
  { to: "/about", label: "How It Works" },
] as const;

export function AppNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-navy text-primary-foreground">
            <TrainFront className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight text-navy">RailSense</span>
            <span className="block text-[11px] text-muted-foreground">Predict. Plan. Arrive Better.</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-navy data-[status=active]:bg-accent data-[status=active]:text-navy"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
