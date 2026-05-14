import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ZahlungListRow } from "@/lib/map-zahlung-row";
import { zahlungRowToStorePayment } from "@/lib/map-zahlung-row";
import { DEMO_PAYMENTS } from "@/data/demo-payments";
import { flowStepToStepperIndex, useFlowStore } from "@/store/useFlowStore";

export const Route = createFileRoute("/zahlungen")({
  head: () => ({
    meta: [{ title: "Schritt 3: Zahlungen — Global Finance Solutions" }],
  }),
  component: ZahlungenPage,
});

function formatEur(n: number) {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

/** Match Auswertungs-Logik für monatliche Äquivalente (deutsche Frequenz-Labels). */
function monthlyEquivalent(p: ZahlungListRow): number {
  const f = p.frequency.toLowerCase();
  let factor = 0;
  if (f === "monatlich") factor = 1;
  else if (f === "quartalsweise") factor = 1 / 3;
  else if (f === "halbjährlich") factor = 1 / 6;
  else if (f === "jährlich") factor = 1 / 12;
  return p.amount * factor;
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

function PaymentRow({
  p,
  isOn,
  onToggle,
  disabled,
  variant,
}: {
  p: ZahlungListRow;
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
  variant: "low" | "default";
}) {
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "w-full text-left rounded-2xl border-2 bg-card px-4 sm:px-5 py-4 flex items-center gap-4 transition-all",
          disabled && "opacity-50 pointer-events-none",
          variant === "low" &&
            "border-[color:var(--secondary)]/50 ring-1 ring-[color:var(--secondary)]/20",
          isOn
            ? "border-primary/60 shadow-[0_8px_30px_-15px_oklch(0.88_0.21_130/0.5)]"
            : "border-border hover:border-primary/30 opacity-80",
        )}
      >
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold truncate">{p.name}</span>
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {p.type}
            </span>
            {variant === "low" && (
              <span className="inline-flex items-center rounded-full border border-[color:var(--secondary)]/45 bg-[color:var(--secondary)]/15 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--secondary)]">
                Prüfung empfohlen
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground font-mono truncate">
            {p.iban}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-bold text-primary text-base">{formatEur(p.amount)}</div>
          <div className="text-xs text-muted-foreground">{p.frequency}</div>
        </div>
      </button>
    </li>
  );
}

function ZahlungenPage() {
  const { setFormData, nextStep, prevStep, currentStep, formData } = useFlowStore();
  const manualRows = formData.zahlungenManualRows ?? [];
  const demoPayments = DEMO_PAYMENTS;

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [noneTransfer, setNoneTransfer] = useState(false);

  const lowConfidence = useMemo(
    () => demoPayments.filter((p) => p.confidence === "low"),
    [],
  );
  const highMediumDemo = useMemo(
    () => demoPayments.filter((p) => p.confidence !== "low"),
    [],
  );

  const allRows = useMemo(
    () => [...manualRows, ...demoPayments],
    [manualRows],
  );

  const selectableIds = useMemo(() => {
    const manualIds = manualRows.map((p) => p.id);
    const demoIds = highMediumDemo.map((p) => p.id);
    return [...manualIds, ...demoIds];
  }, [manualRows, highMediumDemo]);

  const totalEntries = allRows.length;

  const count = selected.size;
  const allSelectableOn =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggle = (id: string) => {
    if (noneTransfer) return;
    setNoneTransfer(false);
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setNoneTransferChecked = (checked: boolean) => {
    setNoneTransfer(checked);
    if (checked) setSelected(new Set());
  };

  const totalMonthly = useMemo(() => {
    return allRows
      .filter((p) => selected.has(p.id))
      .reduce((sum, p) => sum + monthlyEquivalent(p), 0);
  }, [selected, allRows]);

  const canContinue = noneTransfer || count > 0;
  const hasManualBlend = manualRows.length > 0;

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
            <Stepper currentStep={flowStepToStepperIndex(currentStep)} />
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
              {hasManualBlend && (
                <p className="mt-2 text-xs text-muted-foreground max-w-xl mx-auto">
                  Zuerst Ihre erfassten Zahlungen, darunter zusätzlich die Demo-Auswertung
                  der Bank (manuelle Erfassung + Beispieldaten).
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card/80 px-4 sm:px-5 py-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <Switch
                  checked={noneTransfer}
                  onCheckedChange={setNoneTransferChecked}
                  className="data-[state=checked]:bg-[color:var(--secondary)] mt-0.5"
                />
                <span className="text-sm leading-snug">
                  <span className="font-medium">Keine dieser Zahlungen übernehmen</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    Aktivieren Sie dies, wenn Sie keine Lastschriften oder Daueraufträge
                    umstellen möchten.
                  </span>
                </span>
              </label>
            </div>

            <div
              className={cn(
                "mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 sm:px-5 py-3",
                noneTransfer && "opacity-40 pointer-events-none",
              )}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <Switch
                  checked={allSelectableOn}
                  onCheckedChange={(checked) => {
                    if (noneTransfer) return;
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (checked) {
                        for (const id of selectableIds) next.add(id);
                      } else {
                        for (const id of selectableIds) next.delete(id);
                      }
                      return next;
                    });
                  }}
                  disabled={noneTransfer || selectableIds.length === 0}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm font-medium">
                  Alle sicheren Treffer auswählen
                </span>
              </label>
              <span className="inline-flex items-center rounded-full bg-primary/15 border border-primary/40 px-3 py-1 text-xs font-semibold text-primary">
                {count} von {totalEntries} ausgewählt
              </span>
            </div>

            {manualRows.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-bold text-foreground tracking-tight mb-2">
                  Ihre erfassten Zahlungen
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Von Ihnen im Schritt „Altes Konto“ erfasst.
                </p>
                <ul className="space-y-3">
                  {manualRows.map((p) => (
                    <PaymentRow
                      key={p.id}
                      p={p}
                      isOn={selected.has(p.id)}
                      onToggle={() => toggle(p.id)}
                      disabled={noneTransfer}
                      variant="default"
                    />
                  ))}
                </ul>
              </div>
            )}

            {hasManualBlend && (lowConfidence.length > 0 || highMediumDemo.length > 0) && (
              <p className="mt-8 text-xs text-muted-foreground border-t border-border pt-4">
                Aus simulierter Bankauswertung (Demo), inkl. Unsicherheitsstufen wie bei
                automatischer Analyse.
              </p>
            )}

            {lowConfidence.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-bold text-[color:var(--secondary)] tracking-tight mb-2">
                  Bitte einzeln prüfen (unsichere Zuordnung)
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Diese Zahlungen konnten wir nicht mit hoher Sicherheit zuordnen.
                </p>
                <ul className="space-y-3">
                  {lowConfidence.map((p) => (
                    <PaymentRow
                      key={p.id}
                      p={p}
                      isOn={selected.has(p.id)}
                      onToggle={() => toggle(p.id)}
                      disabled={noneTransfer}
                      variant="low"
                    />
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-sm font-bold text-foreground tracking-tight mb-3">
                {hasManualBlend
                  ? "Demo: Erkannt (mittlere / hohe Sicherheit)"
                  : "Erkannt (mittlere / hohe Sicherheit)"}
              </h2>
              <ul className="space-y-3">
                {highMediumDemo.map((p) => (
                  <PaymentRow
                    key={p.id}
                    p={p}
                    isOn={selected.has(p.id)}
                    onToggle={() => toggle(p.id)}
                    disabled={noneTransfer}
                    variant="default"
                  />
                ))}
              </ul>
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => prevStep()}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </button>
            </div>
          </div>
        </main>

        <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur-md">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">
                {noneTransfer
                  ? "Keine Zahlungen werden übernommen"
                  : `${count} ${count === 1 ? "Zahlung wird" : "Zahlungen werden"} übertragen`}
              </div>
              <div className="text-xs text-muted-foreground">
                {noneTransfer ? "—" : `ca. ${formatEur(totalMonthly)} / Monat`}
              </div>
            </div>
            <Button
              type="button"
              disabled={!canContinue}
              onClick={() => {
                if (noneTransfer) {
                  setFormData({ selectedPayments: [], noPaymentsSelected: true });
                } else {
                  const rows = allRows.filter((p) => selected.has(p.id));
                  setFormData({
                    selectedPayments: rows.map((p) =>
                      zahlungRowToStorePayment(p, true),
                    ),
                    noPaymentsSelected: false,
                  });
                }
                nextStep();
              }}
              className={cn(
                "h-12 px-7 text-base font-semibold transition-all w-full sm:w-auto",
                canContinue
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
