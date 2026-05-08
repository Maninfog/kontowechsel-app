import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Pencil, Rocket } from "lucide-react";

import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pruefen")({
  head: () => ({
    meta: [{ title: "Schritt 4: Prüfen — Global Finance Solutions" }],
  }),
  component: PruefenPage,
});

const ACCOUNT = {
  holder: "Max Mustermann",
  iban: "DE12 3456 7890 1234 5678 90",
  bank: "Sparkasse München",
  date: "01.06.2026",
};

const PAYMENTS = [
  { name: "Netflix", amount: "€ 12,99" },
  { name: "Stadtwerke München", amount: "€ 89,50" },
  { name: "Amazon Prime", amount: "€ 8,99" },
  { name: "Miete — Hausverwaltung GmbH", amount: "€ 1.240,00" },
  { name: "GEZ / ARD ZDF", amount: "€ 55,08" },
  { name: "Vodafone GmbH", amount: "€ 39,99" },
  { name: "Spotify", amount: "€ 10,99" },
  { name: "Allianz Versicherung", amount: "€ 287,50" },
];

function Ribbons() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -top-20 -right-20 h-[420px] w-[420px] sm:h-[560px] sm:w-[560px] opacity-70"
      viewBox="0 0 600 600"
      fill="none"
    >
      <defs>
        <linearGradient id="pg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8E63D" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8E63D" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="pg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C840" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8C840" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="pg3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0A0B8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F0A0B8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d="M-50 220 C 120 80, 320 80, 520 240 S 720 460, 560 560" stroke="url(#pg1)" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M-30 300 C 160 160, 360 160, 560 320 S 760 540, 600 640" stroke="url(#pg2)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M40 160 C 200 40, 400 60, 580 200 S 760 420, 620 520" stroke="url(#pg3)" strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function PruefenPage() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? PAYMENTS : PAYMENTS.slice(0, 3);
  const remaining = PAYMENTS.length - 3;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Ribbons />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.88_0.21_130/0.08)] blur-3xl" />

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
            <Stepper currentStep={3} />
          </div>
        </div>

        <main className="flex-1 px-5 sm:px-8 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Alles korrekt?
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[color:var(--tertiary)]">
                Bitte prüfen Sie Ihre Angaben vor dem Absenden.
              </p>
            </div>

            {/* Summary cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Neues Konto */}
              <SummaryCard
                accent="primary"
                title="Neues Konto"
                onEdit={() => navigate({ to: "/wechsel" })}
              >
                <Row label="Kontoinhaber" value={ACCOUNT.holder} />
                <Row label="IBAN" value={ACCOUNT.iban} mono />
                <Row label="Bank" value={ACCOUNT.bank} />
                <Row label="Wechseldatum" value={ACCOUNT.date} />
              </SummaryCard>

              {/* Übertragene Zahlungen */}
              <SummaryCard
                accent="gold"
                title="Übertragene Zahlungen"
                onEdit={() => navigate({ to: "/zahlungen" })}
              >
                <div className="text-sm font-semibold">
                  {PAYMENTS.length} Zahlungen ausgewählt
                </div>
                <ul className="mt-3 space-y-2">
                  {visible.map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-foreground/90">
                        {p.name}
                      </span>
                      <span className="font-semibold text-primary shrink-0">
                        {p.amount}
                      </span>
                    </li>
                  ))}
                </ul>
                {!showAll && remaining > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="mt-3 text-xs font-medium text-[color:var(--secondary)] hover:underline"
                  >
                    + {remaining} weitere anzeigen
                  </button>
                )}
                {showAll && PAYMENTS.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="mt-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Weniger anzeigen
                  </button>
                )}
              </SummaryCard>
            </div>

            {/* Legal */}
            <button
              type="button"
              onClick={() => setConfirmed((v) => !v)}
              className={cn(
                "mt-8 w-full text-left rounded-2xl border-2 p-5 flex items-start gap-4 transition-all bg-card",
                confirmed
                  ? "border-primary/60 shadow-[0_8px_30px_-15px_oklch(0.88_0.21_130/0.5)]"
                  : "border-border hover:border-primary/30",
              )}
            >
              <span
                className={cn(
                  "shrink-0 mt-0.5 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors",
                  confirmed
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background/40",
                )}
              >
                {confirmed && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
              <span className="text-sm leading-relaxed">
                Ich bestätige, dass alle Angaben korrekt sind und ermächtige{" "}
                <span className="font-semibold">Global Finance Solutions</span>{" "}
                zur Durchführung des Kontowechsels.
              </span>
            </button>

            {/* Submit */}
            <Button
              type="button"
              disabled={!confirmed}
              onClick={() => navigate({ to: "/fertig" })}
              className={cn(
                "mt-6 w-full h-14 text-base sm:text-lg font-bold transition-all",
                confirmed
                  ? "bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)] shadow-[0_12px_40px_-10px_oklch(0.88_0.21_130/0.7)] ring-1 ring-primary/40"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60 hover:bg-muted",
              )}
            >
              Jetzt Kontowechsel starten
              <Rocket className="ml-2 h-5 w-5" />
            </Button>

            <div className="mt-6 text-center">
              <Link
                to="/zahlungen"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({
  accent,
  title,
  onEdit,
  children,
}: {
  accent: "primary" | "gold";
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  const accentColor =
    accent === "primary" ? "var(--primary)" : "var(--secondary)";
  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header accent stripe */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: `oklch(from ${accentColor} l c h)` }}
      />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: `oklch(from ${accentColor} l c h)` }}
            />
            {title}
          </h2>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Bearbeiten
            </button>
          )}
        </div>
        <div className="space-y-2.5">{children}</div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={cn(
          "font-medium text-foreground text-right truncate",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );
}
