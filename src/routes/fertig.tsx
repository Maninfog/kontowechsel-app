import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Check, Download, Mail, Send } from "lucide-react";

import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/fertig")({
  head: () => ({
    meta: [{ title: "Fertig — Global Finance Solutions" }],
  }),
  component: FertigPage,
});

function Ribbons() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -top-20 -right-20 h-[420px] w-[420px] sm:h-[560px] sm:w-[560px] opacity-70"
      viewBox="0 0 600 600"
      fill="none"
    >
      <defs>
        <linearGradient id="fg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8E63D" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8E63D" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="fg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C840" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8C840" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="fg3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0A0B8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F0A0B8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d="M-50 220 C 120 80, 320 80, 520 240 S 720 460, 560 560" stroke="url(#fg1)" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M-30 300 C 160 160, 360 160, 560 320 S 760 540, 600 640" stroke="url(#fg2)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M40 160 C 200 40, 400 60, 580 200 S 760 420, 620 520" stroke="url(#fg3)" strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function fireConfetti() {
  const colors = ["#A8E63D", "#E8C840", "#F0A0B8"];
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 65,
      startVelocity: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 65,
      startVelocity: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  // Initial big burst
  confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 45,
    origin: { y: 0.55 },
    colors,
  });
  frame();
}

function FertigPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(fireConfetti, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Ribbons />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.88_0.21_130/0.1)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[oklch(0.85_0.16_95/0.08)] blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-5 sm:px-8 py-5">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm sm:text-base font-semibold tracking-tight">
                Global Finance Solutions
              </span>
            </Link>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Sicher · Digital · BaFin-reguliert
            </span>
          </div>
        </header>

        <div className="px-5 sm:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-5">
            <Stepper currentStep={4} />
          </div>
        </div>

        <main className="flex-1 px-5 sm:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl flex flex-col items-center text-center">
            {/* Animated checkmark */}
            <div className="relative animate-scale-in">
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-primary flex items-center justify-center shadow-[0_20px_60px_-15px_oklch(0.88_0.21_130/0.7)] ring-4 ring-primary/30">
                <Check
                  className="h-12 w-12 sm:h-14 sm:w-14 text-primary-foreground"
                  strokeWidth={3}
                />
              </div>
            </div>

            <h1 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight animate-fade-in">
              Ihr Kontowechsel läuft!
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[color:var(--tertiary)] animate-fade-in">
              Wir benachrichtigen jetzt alle 8 Zahlungspartner automatisch.
            </p>

            {/* Progress card */}
            <div className="mt-10 w-full rounded-2xl border border-border bg-card p-6 sm:p-8 text-left animate-fade-in">
              <h2 className="text-lg font-bold">Was passiert als nächstes?</h2>

              <ol className="mt-6 relative space-y-6">
                {/* connecting line */}
                <span
                  aria-hidden="true"
                  className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-[color:var(--secondary)] to-border"
                />

                <TimelineStep
                  state="done"
                  icon={<Check className="h-3 w-3" strokeWidth={3} />}
                  title="Wechselauftrag eingegangen"
                  time="Sofort"
                />
                <TimelineStep
                  state="active"
                  icon={<Send className="h-3 w-3" strokeWidth={2.5} />}
                  title="Benachrichtigungen werden versendet"
                  time="Innerhalb 24h"
                />
                <TimelineStep
                  state="pending"
                  icon={<Mail className="h-3 w-3" strokeWidth={2.5} />}
                  title="Bestätigungen der Zahlungspartner"
                  time="Bis zu 5 Tage"
                />
              </ol>
            </div>

            {/* Download */}
            <div className="mt-8 w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-primary text-foreground bg-transparent hover:bg-primary/10 hover:text-foreground"
              >
                <Download className="mr-2 h-4 w-4" />
                Wechselschreiben herunterladen
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                8 PDF-Dokumente · Je eines pro Zahlungspartner
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard" })}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Zur Übersicht meines Kontowechsels →
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Zurück zur Startseite
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function TimelineStep({
  state,
  icon,
  title,
  time,
}: {
  state: "done" | "active" | "pending";
  icon: React.ReactNode;
  title: string;
  time: string;
}) {
  const dotClass =
    state === "done"
      ? "bg-primary text-primary-foreground"
      : state === "active"
        ? "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]"
        : "bg-muted text-muted-foreground border border-border";

  return (
    <li className="relative pl-10">
      <span
        className={`absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center ${dotClass} ${
          state === "active" ? "ring-4 ring-[color:var(--secondary)]/25" : ""
        }`}
      >
        {icon}
      </span>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={`font-semibold text-sm ${
            state === "pending" ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {title}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">{time}</span>
      </div>
    </li>
  );
}
