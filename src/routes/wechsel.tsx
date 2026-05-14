import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeft, ArrowRight, CalendarIcon, CheckCircle2, User } from "lucide-react";

import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { detectGermanBank, formatIban, isLikelyValidIban, normalizeIban } from "@/lib/iban";
import { flowStepToStepperIndex, useFlowStore } from "@/store/useFlowStore";

export const Route = createFileRoute("/wechsel")({
  head: () => ({
    meta: [{ title: "Schritt 1: Neues Konto — Global Finance Solutions" }],
  }),
  component: NeuesKontoPage,
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
        <linearGradient id="wg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8E63D" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8E63D" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="wg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C840" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8C840" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="wg3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0A0B8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F0A0B8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M-50 220 C 120 80, 320 80, 520 240 S 720 460, 560 560"
        stroke="url(#wg1)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M-30 300 C 160 160, 360 160, 560 320 S 760 540, 600 640"
        stroke="url(#wg2)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 160 C 200 40, 400 60, 580 200 S 760 420, 620 520"
        stroke="url(#wg3)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function NeuesKontoPage() {
  const { formData, setFormData, nextStep, prevStep, currentStep, flowActor } =
    useFlowStore();
  const isEmployee = flowActor === "employee";
  const [holder, setHolder] = useState("");
  const [iban, setIban] = useState("");
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    setHolder(formData.customerName || "");
    setIban(formData.newIban ? formatIban(formData.newIban) : "");
    if (formData.switchDate) {
      try {
        const d = parseISO(formData.switchDate);
        setDate(isNaN(d.getTime()) ? undefined : d);
      } catch {
        setDate(undefined);
      }
    } else {
      setDate(undefined);
    }
  }, [formData.customerName, formData.newIban, formData.switchDate]);

  const detectedBank = useMemo(() => detectGermanBank(iban), [iban]);
  const ibanValid = isLikelyValidIban(iban);
  const canSubmit = holder.trim().length > 1 && ibanValid && !!date;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Ribbons />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.88_0.21_130/0.08)] blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header — same as landing */}
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

        {/* Stepper */}
        <div className="px-5 sm:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-5">
            <Stepper currentStep={flowStepToStepperIndex(currentStep)} />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 px-5 sm:px-8 py-10 sm:py-14">
          <div className="mx-auto max-w-xl">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {isEmployee ? "Neues Konto des Kunden" : "Ihr neues Konto"}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[color:var(--tertiary)]">
                {isEmployee
                  ? "Erfassen Sie die Kundendaten für den Kontowechsel."
                  : "Geben Sie die Daten Ihres neuen Kontos ein."}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                setFormData({
                  customerName: holder.trim(),
                  newIban: normalizeIban(iban),
                  newBankName: detectedBank ?? "",
                  switchDate: date ? format(date, "yyyy-MM-dd") : "",
                });
                nextStep();
              }}
              className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)] space-y-5"
            >
              {/* Kontoinhaber */}
              <div className="space-y-2">
                <Label htmlFor="holder">
                  {isEmployee ? "Kontoinhaber (Kunde)" : "Kontoinhaber"}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="holder"
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                    placeholder="Max Mustermann"
                    autoComplete="name"
                    className="pl-9 h-11 bg-background border-border"
                  />
                </div>
              </div>

              {/* IBAN */}
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={iban}
                  onChange={(e) => setIban(formatIban(e.target.value))}
                  placeholder="DE12 3456 7890 1234 5678 90"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={27}
                  className="h-11 bg-background border-border font-mono tracking-wide"
                />
                {detectedBank && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/40 px-3 py-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {detectedBank} erkannt
                  </div>
                )}
                {!detectedBank && normalizeIban(iban).length >= 12 && (
                  <p className="text-xs text-muted-foreground">
                    Bank wird geprüft …
                  </p>
                )}
              </div>

              {/* Wechseldatum */}
              <div className="space-y-2">
                <Label htmlFor="date">Wechseldatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-normal bg-background border-border hover:bg-background hover:text-foreground",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {date
                        ? format(date, "PPP", { locale: de })
                        : "Datum auswählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-card border-border"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={de}
                      disabled={(d) =>
                        d < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full h-12 text-base font-semibold transition-all",
                  canSubmit
                    ? "bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)] shadow-[0_8px_30px_-8px_oklch(0.88_0.21_130/0.6)] ring-1 ring-primary/40"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-60 hover:bg-muted",
                )}
              >
                Weiter
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
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
      </div>
    </div>
  );
}
