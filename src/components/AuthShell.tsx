import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { useFlowStore } from "@/store/useFlowStore";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** When true, header “Zurück” runs `prevStep()` (Kunden-Flow) instead of linking home. */
  flowBack?: boolean;
}

function Ribbons() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -top-20 -right-20 h-[420px] w-[420px] sm:h-[560px] sm:w-[560px] opacity-70"
      viewBox="0 0 600 600"
      fill="none"
    >
      <defs>
        <linearGradient id="ag1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8E63D" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8E63D" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="ag2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0A0B8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F0A0B8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M-50 220 C 120 80, 320 80, 520 240 S 720 460, 560 560"
        stroke="url(#ag1)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 160 C 200 40, 400 60, 580 200 S 760 420, 620 520"
        stroke="url(#ag2)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function AuthShell({ title, subtitle, children, footer, flowBack }: AuthShellProps) {
  const { prevStep } = useFlowStore();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Ribbons />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.88_0.21_130/0.08)] blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-5 sm:px-8 py-5">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm sm:text-base font-semibold tracking-tight">
                Global Finance Solutions
              </span>
            </Link>
            {flowBack ? (
              <button
                type="button"
                onClick={() => prevStep()}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </button>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {title}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[color:var(--tertiary)]">
                {subtitle}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]">
              {children}
            </div>

            {footer && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
