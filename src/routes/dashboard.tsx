import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Download,
  FileSignature,
  IdCard,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/Stepper";
import { cn } from "@/lib/utils";
import { flowStepToStepperIndex, useFlowStore } from "@/store/useFlowStore";
import type { Payment } from "@/types/database";
import { DEMO_PAYMENTS, DEMO_PARTNER_STATUS_BY_ID } from "@/data/demo-payments";
import type { ZahlungListRow } from "@/lib/map-zahlung-row";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Mein Kontowechsel — Global Finance Solutions" }],
  }),
  component: DashboardPage,
});

type Status = "confirmed" | "notified" | "pending" | "action";

interface PartnerRow {
  id: string;
  name: string;
  type: "Lastschrift" | "Dauerauftrag";
  amount: number;
  cycle: string;
  color: string;
  initial: string;
  status: Status;
}

const DASHBOARD_COLORS = [
  "#E50914",
  "#0A8FBF",
  "#FF9900",
  "#7B5BD6",
  "#003480",
  "#36A18B",
  "#D946EF",
  "#14854F",
] as const;

function brandForPartner(name: string, id: string): { initial: string; color: string } {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) | 0;
  const color = DASHBOARD_COLORS[Math.abs(h) % DASHBOARD_COLORS.length];
  return { initial, color };
}

function zahlungStringCycle(f: string): string {
  const x = f.toLowerCase();
  if (x.includes("quart")) return "Quartal";
  if (x.includes("jahr")) return "Jahr";
  if (x.includes("woche")) return "Woche";
  if (x.includes("halb")) return "Halbjahr";
  return "Monat";
}

function paymentFrequencyCycle(f: Payment["frequency"]): string {
  switch (f) {
    case "monthly":
      return "Monat";
    case "quarterly":
      return "Quartal";
    case "yearly":
      return "Jahr";
    case "weekly":
      return "Woche";
    default:
      return "Monat";
  }
}

function paymentToPartnerRow(p: Payment): PartnerRow {
  const status = (DEMO_PARTNER_STATUS_BY_ID[p.id] ?? "pending") as Status;
  const { initial, color } = brandForPartner(p.payee_name, p.id);
  return {
    id: p.id,
    name: p.payee_name,
    type: p.type === "lastschrift" ? "Lastschrift" : "Dauerauftrag",
    amount: p.amount,
    cycle: paymentFrequencyCycle(p.frequency),
    color,
    initial,
    status,
  };
}

function demoRowToPartnerRow(row: ZahlungListRow): PartnerRow {
  const status = (DEMO_PARTNER_STATUS_BY_ID[row.id] ?? "pending") as Status;
  const { initial, color } = brandForPartner(row.name, row.id);
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    amount: row.amount,
    cycle: zahlungStringCycle(row.frequency),
    color,
    initial,
    status,
  };
}

const FILTERS: { id: "all" | Status; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "confirmed", label: "Bestätigt" },
  { id: "pending", label: "Ausstehend" },
  { id: "action", label: "Benötigt Aktion" },
];

function formatEur(n: number) {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
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
        <linearGradient id="dg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8E63D" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8E63D" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="dg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C840" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8C840" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="dg3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0A0B8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F0A0B8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d="M-50 220 C 120 80, 320 80, 520 240 S 720 460, 560 560" stroke="url(#dg1)" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M-30 300 C 160 160, 360 160, 560 320 S 760 540, 600 640" stroke="url(#dg2)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M40 160 C 200 40, 400 60, 580 200 S 760 420, 620 520" stroke="url(#dg3)" strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ProgressRing({ value, total }: { value: number; total: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value / total;
  const offset = c * (1 - pct);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(0.34 0.09 298)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(0.88 0.21 130)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold">
          {value}/{total}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const config = {
    confirmed: {
      bg: "bg-primary/15 border-primary/40 text-primary",
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Bestätigt",
    },
    notified: {
      bg: "bg-[oklch(0.7_0.15_240/0.15)] border-[oklch(0.7_0.15_240/0.5)] text-[oklch(0.78_0.13_240)]",
      icon: <Bell className="h-3 w-3" />,
      label: "Benachrichtigt",
    },
    pending: {
      bg: "bg-[color:var(--secondary)]/15 border-[color:var(--secondary)]/45 text-[color:var(--secondary)]",
      icon: <Clock className="h-3 w-3" />,
      label: "Ausstehend",
    },
    action: {
      bg: "bg-destructive/15 border-destructive/45 text-[oklch(0.75_0.18_25)]",
      icon: <AlertTriangle className="h-3 w-3" />,
      label: "Aktion nötig",
    },
  }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        config.bg,
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function DashboardPage() {
  const { currentStep, formData } = useFlowStore();

  const [filter, setFilter] = useState<"all" | Status>("all");

  const partners = useMemo((): PartnerRow[] => {
    if (formData.noPaymentsSelected) return [];
    const chosen = formData.selectedPayments ?? [];
    if (chosen.length > 0) {
      return chosen.map(paymentToPartnerRow);
    }
    return DEMO_PAYMENTS.map(demoRowToPartnerRow);
  }, [formData.selectedPayments, formData.noPaymentsSelected]);

  const timeline = useMemo(() => {
    const n = partners.length;
    return [
      { state: "done" as const, time: "08.05.2026 14:23", text: "Wechselauftrag eingegangen" },
      { state: "done" as const, time: "08.05.2026 14:24", text: `Benachrichtigungen versendet (${n})` },
      { state: "done" as const, time: "09.05.2026 09:11", text: "Netflix hat bestätigt" },
      { state: "done" as const, time: "09.05.2026 11:43", text: "Stadtwerke München hat bestätigt" },
      { state: "active" as const, time: "Ausstehend", text: "Weitere Bestätigungen erwartet" },
      { state: "future" as const, time: "01.06.2026", text: "Kontowechsel abgeschlossen" },
    ];
  }, [partners.length]);

  const confirmed = partners.filter((p) => p.status === "confirmed").length;
  const filtered = useMemo(
    () => (filter === "all" ? partners : partners.filter((p) => p.status === filter)),
    [filter, partners],
  );

  const totalPartners = Math.max(partners.length, 1);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Ribbons />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.88_0.21_130/0.08)] blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="px-5 sm:px-8 py-5 border-b border-border/60">
          <div className="mx-auto max-w-5xl grid grid-cols-3 items-center gap-3">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
              <span className="text-sm font-semibold tracking-tight truncate">
                Global Finance Solutions
              </span>
            </Link>
            <h1 className="text-center text-sm sm:text-base font-medium truncate">
              Mein Kontowechsel
            </h1>
            <div className="flex justify-end">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                AM
              </div>
            </div>
          </div>
        </header>

        <div className="px-5 sm:px-8 pt-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-5">
            <Stepper currentStep={flowStepToStepperIndex(currentStep)} />
          </div>
        </div>

        <main className="flex-1 px-5 sm:px-8 py-8 sm:py-10">
          <div className="mx-auto max-w-5xl space-y-8">
            {/* HERO STATUS */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--secondary)]/45 bg-[color:var(--secondary)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--secondary)]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 rounded-full bg-[color:var(--secondary)] animate-ping opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-[color:var(--secondary)]" />
                  </span>
                  In Bearbeitung
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Kontowechsel läuft
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Gestartet am 08.05.2026 · Wechseldatum:{" "}
                  <span className="text-foreground font-medium">01.06.2026</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <ProgressRing value={confirmed} total={totalPartners} />
                <span className="text-xs text-muted-foreground">
                  Zahlungspartner bestätigt
                </span>
              </div>
            </section>

            {/* ATTENTION */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-[color:var(--secondary)]" />
                <h3 className="text-lg font-bold">Ihre Aufmerksamkeit erforderlich</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionCard
                  icon={<IdCard className="h-5 w-5" />}
                  title="Identität bestätigen"
                  description="Bitte verifizieren Sie sich mit Ihrem Ausweis (VideoIdent)."
                  cta="Jetzt verifizieren"
                />
                <ActionCard
                  icon={<FileSignature className="h-5 w-5" />}
                  title="Unterschrift erforderlich"
                  description="Dauerauftrag Miete · Hausverwaltung GmbH benötigt Ihre Unterschrift."
                  cta="Jetzt unterschreiben"
                />
              </div>
            </section>

            {/* PARTNERS */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold">Zahlungspartner</h3>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold border transition-colors",
                        filter === f.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="space-y-3">
                {partners.length === 0 && filter === "all" ? (
                  <li className="rounded-2xl border border-dashed border-border bg-card/40 px-5 py-10 text-center text-sm text-muted-foreground">
                    Sie haben keine Zahlungen für den Wechsel ausgewählt. Sie können
                    jederzeit Zahlungspartner im Nachgang hinzufügen.
                  </li>
                ) : (
                  filtered.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-2xl border border-border bg-card px-4 sm:px-5 py-4 flex items-center gap-4"
                    >
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {p.type} · {formatEur(p.amount)}/{p.cycle}
                        </div>
                      </div>
                      <StatusBadge status={p.status} />
                    </li>
                  ))
                )}
                {partners.length > 0 && filtered.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-border bg-card/40 px-5 py-10 text-center text-sm text-muted-foreground">
                    Keine Einträge in dieser Kategorie.
                  </li>
                )}
              </ul>
            </section>

            {/* TIMELINE */}
            <section>
              <h3 className="text-lg font-bold mb-4">Verlauf</h3>
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <ol className="relative space-y-5">
                  <span
                    aria-hidden="true"
                    className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-primary/50 to-border"
                  />
                  {timeline.map((t, i) => (
                    <li key={i} className="relative pl-9">
                      <span
                        className={cn(
                          "absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center",
                          t.state === "done" &&
                            "bg-primary text-primary-foreground",
                          t.state === "active" &&
                            "bg-card border-2 border-dashed border-[color:var(--secondary)] text-[color:var(--secondary)]",
                          t.state === "future" &&
                            "bg-muted border border-border text-muted-foreground",
                        )}
                      >
                        {t.state === "done" && (
                          <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
                        )}
                        {t.state === "active" && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {t.state === "future" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                        )}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            t.state === "future" && "text-muted-foreground",
                          )}
                        >
                          {t.text}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {t.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* DOWNLOAD */}
            <section>
              <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[color:var(--secondary)]"
                />
                <div className="p-6 sm:p-7 pl-7 sm:pl-8">
                  <h3 className="text-lg font-bold">Ihre Dokumente</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {partners.length} PDFs · Generiert am 08.05.2026
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 h-11 px-5 text-sm font-semibold border-2 border-primary text-foreground bg-transparent hover:bg-primary/10 hover:text-foreground"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Alle Wechselschreiben herunterladen
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-1 bg-[color:var(--secondary)]"
      />
      <div className="p-5 sm:p-6 pl-6 sm:pl-7">
        <div className="flex items-start justify-between gap-3">
          <div className="h-10 w-10 rounded-xl bg-[color:var(--secondary)]/15 text-[color:var(--secondary)] flex items-center justify-center">
            {icon}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--secondary)]/45 bg-[color:var(--secondary)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[color:var(--secondary)]">
            <Clock className="h-3 w-3" />
            Ausstehend
          </span>
        </div>
        <h4 className="mt-4 font-bold">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <Button
          type="button"
          className="mt-4 h-9 px-4 text-xs font-semibold rounded-full bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--secondary)]/90"
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}
