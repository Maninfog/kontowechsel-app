import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/zahlungen")({
  head: () => ({
    meta: [{ title: "Schritt 3: Zahlungen — Global Finance Solutions" }],
  }),
  component: ZahlungenPage,
});

type PaymentType = "Lastschrift" | "Dauerauftrag";

interface Payment {
  id: string;
  name: string;
  type: PaymentType;
  iban: string;
  amount: number;
  frequency: string;
}

const PAYMENTS: Payment[] = [
  {
    id: "1",
    name: "Netflix",
    type: "Lastschrift",
    iban: "DE89 **** **** 1234",
    amount: 12.99,
    frequency: "monatlich",
  },
  {
    id: "2",
    name: "Stadtwerke München",
    type: "Lastschrift",
    iban: "DE12 **** **** 5678",
    amount: 89.5,
    frequency: "monatlich",
  },
  {
    id: "3",
    name: "Amazon Prime",
    type: "Lastschrift",
    iban: "DE45 **** **** 9012",
    amount: 89.9,
    frequency: "jährlich",
  },
  {
    id: "4",
    name: "Miete — Hausverwaltung GmbH",
    type: "Dauerauftrag",
    iban: "DE67 **** **** 3456",
    amount: 1240.0,
    frequency: "monatlich",
  },
  {
    id: "5",
    name: "GEZ / ARD ZDF Beitragsservice",
    type: "Lastschrift",
    iban: "DE34 **** **** 7890",
    amount: 55.08,
    frequency: "quartalsweise",
  },
  {
    id: "6",
    name: "Vodafone GmbH",
    type: "Lastschrift",
    iban: "DE56 **** **** 2345",
    amount: 39.99,
    frequency: "monatlich",
  },
  {
    id: "7",
    name: "Spotify AB",
    type: "Lastschrift",
    iban: "DE78 **** **** 6789",
    amount: 10.99,
    frequency: "monatlich",
  },
  {
    id: "8",
    name: "Allianz Versicherung",
    type: "Dauerauftrag",
    iban: "DE90 **** **** 0123",
    amount: 287.5,
    frequency: "jährlich",
  },
];

function formatEur(n: number) {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
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
        <linearGradient id="zg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8E63D" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8E63D" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="zg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C840" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8C840" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="zg3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0A0B8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F0A0B8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d="M-50 220 C 120 80, 320 80, 520 240 S 720 460, 560 560" stroke="url(#zg1)" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M-30 300 C 160 160, 360 160, 560 320 S 760 540, 600 640" stroke="url(#zg2)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M40 160 C 200 40, 400 60, 580 200 S 760 420, 620 520" stroke="url(#zg3)" strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ZahlungenPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(PAYMENTS.map((p) => p.id)),
  );

  const allSelected = selected.size === PAYMENTS.length;
  const count = selected.size;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(PAYMENTS.map((p) => p.id)));
  };

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalMonthly = useMemo(() => {
    return PAYMENTS.filter((p) => selected.has(p.id)).reduce((sum, p) => {
      const factor =
        p.frequency === "monatlich"
          ? 1
          : p.frequency === "quartalsweise"
            ? 1 / 3
            : p.frequency === "halbjährlich"
              ? 1 / 6
              : p.frequency === "jährlich"
                ? 1 / 12
                : 0;
      return sum + p.amount * factor;
    }, 0);
  }, [selected]);

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
            <Stepper currentStep={2} />
          </div>
        </div>

        <main className="flex-1 px-5 sm:px-8 py-10 sm:py-14 pb-40">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ihre wiederkehrenden Zahlungen
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[color:var(--tertiary)]">
                Wählen Sie aus, welche auf Ihr neues Konto übertragen werden sollen.
              </p>
            </div>

            {/* Top bar */}
            <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 sm:px-5 py-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Switch
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm font-medium">Alle auswählen</span>
              </label>
              <span className="inline-flex items-center rounded-full bg-primary/15 border border-primary/40 px-3 py-1 text-xs font-semibold text-primary">
                {count} von {PAYMENTS.length} ausgewählt
              </span>
            </div>

            {/* Payment list */}
            <ul className="mt-4 space-y-3">
              {PAYMENTS.map((p) => {
                const isOn = selected.has(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      className={cn(
                        "w-full text-left rounded-2xl border-2 bg-card px-4 sm:px-5 py-4 flex items-center gap-4 transition-all",
                        isOn
                          ? "border-primary/60 shadow-[0_8px_30px_-15px_oklch(0.88_0.21_130/0.5)]"
                          : "border-border hover:border-primary/30 opacity-80",
                      )}
                    >
                      {/* Custom checkbox */}
                      <span
                        className={cn(
                          "shrink-0 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors",
                          isOn
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-background/40",
                        )}
                      >
                        {isOn && <Check className="h-4 w-4" strokeWidth={3} />}
                      </span>

                      {/* Middle */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold truncate">
                            {p.name}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                            {p.type}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground font-mono truncate">
                          {p.iban}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="text-right shrink-0">
                        <div className="font-bold text-primary text-base">
                          {formatEur(p.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.frequency}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 text-center">
              <Link
                to="/altes-konto"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Link>
            </div>
          </div>
        </main>

        {/* Sticky bottom bar */}
        <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur-md">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">
                {count} {count === 1 ? "Zahlung wird" : "Zahlungen werden"}{" "}
                übertragen
              </div>
              <div className="text-xs text-muted-foreground">
                ca. {formatEur(totalMonthly)} / Monat
              </div>
            </div>
            <Button
              type="button"
              disabled={count === 0}
              onClick={() => navigate({ to: "/pruefen" })}
              className={cn(
                "h-12 px-7 text-base font-semibold transition-all w-full sm:w-auto",
                count > 0
                  ? "bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)] shadow-[0_8px_30px_-8px_oklch(0.88_0.21_130/0.6)] ring-1 ring-primary/40"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60 hover:bg-muted",
              )}
            >
              Weiter
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
