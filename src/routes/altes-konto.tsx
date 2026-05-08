import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Pencil,
  Plus,
  Trash2,
  Sparkles,
  Lock,
} from "lucide-react";

import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatIban } from "@/lib/iban";
import { flowStepToStepperIndex, useFlowStore } from "@/store/useFlowStore";

export const Route = createFileRoute("/altes-konto")({
  head: () => ({
    meta: [{ title: "Schritt 2: Altes Konto — Global Finance Solutions" }],
  }),
  component: AltesKontoPage,
});

type Mode = "auto" | "manual" | null;

interface ManualPayment {
  id: string;
  recipient: string;
  iban: string;
  amount: string;
  cycle: string;
}

const BANKS: { name: string; color: string; initial: string }[] = [
  { name: "Sparkasse", color: "#E2001A", initial: "S" },
  { name: "Deutsche Bank", color: "#0018A8", initial: "D" },
  { name: "Commerzbank", color: "#FFCC00", initial: "C" },
  { name: "ING", color: "#FF6200", initial: "I" },
  { name: "DKB", color: "#14854F", initial: "D" },
  { name: "Volksbank", color: "#F39200", initial: "V" },
  { name: "N26", color: "#36A18B", initial: "N" },
  { name: "Comdirect", color: "#FFEB00", initial: "c" },
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
        <linearGradient id="ak1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8E63D" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8E63D" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="ak2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C840" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8C840" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="ak3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0A0B8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F0A0B8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M-50 220 C 120 80, 320 80, 520 240 S 720 460, 560 560"
        stroke="url(#ak1)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M-30 300 C 160 160, 360 160, 560 320 S 760 540, 600 640"
        stroke="url(#ak2)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 160 C 200 40, 400 60, 580 200 S 760 420, 620 520"
        stroke="url(#ak3)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function AltesKontoPage() {
  const { setFormData, nextStep, prevStep, currentStep } = useFlowStore();
  const [mode, setMode] = useState<Mode>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Omit<ManualPayment, "id">>({
    recipient: "",
    iban: "",
    amount: "",
    cycle: "monatlich",
  });

  const draftValid =
    draft.recipient.trim().length > 1 &&
    draft.iban.replace(/\s/g, "").length >= 15 &&
    parseFloat(draft.amount) > 0;

  const canContinue =
    (mode === "auto" && !!selectedBank) ||
    (mode === "manual" && payments.length > 0);

  const addPayment = () => {
    if (!draftValid) return;
    setPayments((p) => [...p, { ...draft, id: crypto.randomUUID() }]);
    setDraft({ recipient: "", iban: "", amount: "", cycle: "monatlich" });
    setShowForm(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Ribbons />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.88_0.21_130/0.08)] blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
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

        {/* Stepper — Altes Konto active */}
        <div className="px-5 sm:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-5">
            <Stepper currentStep={flowStepToStepperIndex(currentStep)} />
          </div>
        </div>

        <main className="flex-1 px-5 sm:px-8 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ihr altes Konto verbinden
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[color:var(--tertiary)]">
                So erkennen wir Ihre bestehenden Zahlungen automatisch.
              </p>
            </div>

            {/* Option cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OptionCard
                selected={mode === "auto"}
                onClick={() => setMode("auto")}
                icon={<Building2 className="h-6 w-6" />}
                title="Automatisch"
                description="Wir lesen Ihre Lastschriften & Daueraufträge direkt aus."
                badge="Empfohlen"
                accent="primary"
              />
              <OptionCard
                selected={mode === "manual"}
                onClick={() => setMode("manual")}
                icon={<Pencil className="h-6 w-6" />}
                title="Manuell"
                description="Tragen Sie Ihre wiederkehrenden Zahlungen selbst ein."
                accent="muted"
              />
            </div>

            {/* Auto mode — bank picker */}
            {mode === "auto" && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h2 className="text-lg font-semibold">Wählen Sie Ihre Bank</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sie werden anschließend sicher zur Bank weitergeleitet.
                </p>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BANKS.map((bank) => {
                    const isSel = selectedBank === bank.name;
                    return (
                      <button
                        key={bank.name}
                        type="button"
                        onClick={() => setSelectedBank(bank.name)}
                        className={cn(
                          "group relative rounded-xl bg-white px-3 py-4 flex flex-col items-center justify-center gap-2 transition-all border-2",
                          isSel
                            ? "border-primary ring-4 ring-primary/30 shadow-[0_8px_30px_-8px_oklch(0.88_0.21_130/0.6)]"
                            : "border-transparent hover:border-primary/40",
                        )}
                      >
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-base"
                          style={{ backgroundColor: bank.color }}
                        >
                          {bank.initial}
                        </div>
                        <span className="text-xs font-semibold text-[color:var(--background)] text-center leading-tight">
                          {bank.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedBank && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ oldBankName: selectedBank, oldIban: "" });
                      nextStep();
                    }}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <Lock className="h-4 w-4" />
                    Weiter zur sicheren Anmeldung
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Manual mode */}
            {mode === "manual" && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Wiederkehrende Zahlungen
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {payments.length === 0
                        ? "Noch keine Zahlungen erfasst."
                        : `${payments.length} Zahlung${payments.length === 1 ? "" : "en"} erfasst.`}
                    </p>
                  </div>
                  {!showForm && (
                    <Button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)] gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Hinzufügen
                    </Button>
                  )}
                </div>

                {/* Payment list */}
                {payments.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {payments.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/40 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {p.recipient}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {p.iban}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-semibold text-primary">
                            {parseFloat(p.amount).toFixed(2)} €
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {p.cycle}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPayments((list) =>
                              list.filter((x) => x.id !== p.id),
                            )
                          }
                          className="text-muted-foreground hover:text-destructive p-1"
                          aria-label="Entfernen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Inline form */}
                {showForm && (
                  <div className="mt-5 rounded-xl border border-primary/40 bg-background/40 p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Zahlungsempfänger</Label>
                        <Input
                          id="recipient"
                          value={draft.recipient}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              recipient: e.target.value,
                            }))
                          }
                          placeholder="z. B. Vodafone GmbH"
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="m-iban">IBAN</Label>
                        <Input
                          id="m-iban"
                          value={draft.iban}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              iban: formatIban(e.target.value),
                            }))
                          }
                          placeholder="DE12 3456 7890 …"
                          className="bg-background border-border font-mono"
                          maxLength={27}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Betrag (€)</Label>
                        <Input
                          id="amount"
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={draft.amount}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, amount: e.target.value }))
                          }
                          placeholder="49,90"
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cycle">Rhythmus</Label>
                        <Select
                          value={draft.cycle}
                          onValueChange={(v) =>
                            setDraft((d) => ({ ...d, cycle: v }))
                          }
                        >
                          <SelectTrigger
                            id="cycle"
                            className="bg-background border-border"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monatlich">Monatlich</SelectItem>
                            <SelectItem value="quartalsweise">
                              Quartalsweise
                            </SelectItem>
                            <SelectItem value="halbjährlich">
                              Halbjährlich
                            </SelectItem>
                            <SelectItem value="jährlich">Jährlich</SelectItem>
                            <SelectItem value="einmalig">Einmalig</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowForm(false);
                          setDraft({
                            recipient: "",
                            iban: "",
                            amount: "",
                            cycle: "monatlich",
                          });
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Abbrechen
                      </Button>
                      <Button
                        type="button"
                        onClick={addPayment}
                        disabled={!draftValid}
                        className={cn(
                          "transition-all",
                          draftValid
                            ? "bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)]"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60 hover:bg-muted",
                        )}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Hinzufügen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Continue */}
            <div className="mt-8">
              <Button
                type="button"
                disabled={!canContinue}
                onClick={() => {
                  if (mode === "auto") {
                    setFormData({ oldBankName: selectedBank ?? "", oldIban: "" });
                  } else {
                    setFormData({ oldBankName: "", oldIban: "" });
                  }
                  nextStep();
                }}
                className={cn(
                  "w-full h-12 text-base font-semibold transition-all",
                  canContinue
                    ? "bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)] shadow-[0_8px_30px_-8px_oklch(0.88_0.21_130/0.6)] ring-1 ring-primary/40"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-60 hover:bg-muted",
                )}
              >
                Weiter
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>

              <div className="mt-5 text-center">
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
          </div>
        </main>
      </div>
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  icon,
  title,
  description,
  badge,
  accent,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  accent: "primary" | "muted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative text-left rounded-2xl border-2 p-6 transition-all bg-card",
        selected
          ? "border-primary ring-4 ring-primary/25 shadow-[0_12px_40px_-12px_oklch(0.88_0.21_130/0.55)]"
          : "border-border hover:border-primary/40",
      )}
    >
      {badge && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
          <Sparkles className="h-3 w-3" />
          {badge}
        </span>
      )}
      <div
        className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center",
          accent === "primary"
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  );
}
