import { Link } from "@tanstack/react-router";
import { VetaLogo } from "./VetaLogo";
import { Activity, Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Live Dashboard" },
  { to: "/passenger", label: "Passenger View" },
  { to: "/about", label: "How It Works" },
] as const;

export function AppNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-white/95 backdrop-blur shadow-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        {/* Brand & Tagline */}
        <Link to="/" className="flex items-center gap-3 group">
          <VetaLogo className="size-11 rounded-lg border border-slate-200/80 bg-white p-0.5 shadow-2xs transition-transform group-hover:scale-105" />
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#1F3864]">Veta</span>
              <span className="inline-flex items-center gap-1 rounded-sm bg-[#1565C0]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#1565C0] tracking-wide uppercase">
                <Sparkles className="size-2.5" /> SIH Prototype
              </span>
            </div>
            <span className="block text-[11px] font-medium text-slate-500">
              Predict. Plan. Arrive Better.
            </span>
          </div>
        </Link>

        {/* Live Status and Nav Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
            </span>
            <span className="text-[11px] font-semibold">Indian Railways Live Telemetry</span>
          </div>

          <nav className="flex items-center gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                className="rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#1F3864] data-[status=active]:bg-[#1F3864] data-[status=active]:text-white shadow-xs"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
