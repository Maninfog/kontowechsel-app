import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  ImageIcon,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatIban, normalizeIban } from "@/lib/iban";
import { DEMO_OLD_IBAN_INPUT } from "@/data/demo-payments";
import type { ZahlungListRow } from "@/lib/map-zahlung-row";
import { flowStepToStepperIndex, useFlowStore } from "@/store/useFlowStore";

export const Route = createFileRoute("/altes-konto")({
  head: () => ({
    meta: [{ title: "Schritt 2: Altes Konto — Global Finance Solutions" }],
  }),
  component: AltesKontoPage,
});

type Mode = "auto" | "manual" | null;

/** Sub-flow on this route: login → mode → bank (both paths) → auto: bank-login + analyze | manual: payments */
type Screen =
  | "gfs_login"
  | "choose_mode"
  | "auto_bank"
  | "auto_analyze"
  | "manual_bank"
  | "manual_payments";

interface ManualPayment {
  id: string;
  recipient: string;
  iban: string;
  amount: string;
  cycle: string;
}

function manualPaymentsToZahlungRows(payments: ManualPayment[]): ZahlungListRow[] {
  return payments.map((p) => ({
    id: p.id,
    name: p.recipient,
    type: "Lastschrift",
    iban: p.iban,
    amount: Number.parseFloat(p.amount.replace(",", ".")) || 0,
    frequency: p.cycle,
    confidence: "high",
  }));
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

  const [screen, setScreen] = useState<Screen>("gfs_login");
  const [gfsEmail, setGfsEmail] = useState("");
  const [gfsPassword, setGfsPassword] = useState("");

  const [mode, setMode] = useState<Mode>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const [bankLoginOpen, setBankLoginOpen] = useState(false);
  const [bankUserId, setBankUserId] = useState("");
  const [bankPin, setBankPin] = useState("");

  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [statementPhotoUrl, setStatementPhotoUrl] = useState<string | null>(null);
  const [statementPhotoName, setStatementPhotoName] = useState<string | null>(null);
  const statementCameraInputRef = useRef<HTMLInputElement>(null);
  const statementGalleryInputRef = useRef<HTMLInputElement>(null);
  const statementPhotoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    statementPhotoUrlRef.current = statementPhotoUrl;
  }, [statementPhotoUrl]);

  useEffect(() => {
    return () => {
      const u = statementPhotoUrlRef.current;
      if (u) URL.revokeObjectURL(u);
    };
  }, []);

  const handleStatementPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file?.type.startsWith("image/")) return;
    setStatementPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setStatementPhotoName(file.name);
  };

  const clearStatementPhoto = () => {
    setStatementPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStatementPhotoName(null);
  };

  const [draft, setDraft] = useState<Omit<ManualPayment, "id">>({
    recipient: "",
    iban: "",
    amount: "",
    cycle: "monatlich",
  });

  const gfsCanSubmit =
    gfsEmail.trim().includes("@") && gfsPassword.trim().length >= 4;

  const bankLoginCanSubmit =
    bankUserId.trim().length >= 3 && bankPin.trim().length >= 4;

  const draftValid =
    draft.recipient.trim().length > 1 &&
    draft.iban.replace(/\s/g, "").length >= 15 &&
    parseFloat(draft.amount) > 0;

  const canContinueMode = mode !== null;

  const canManualFinish =
    mode === "manual" &&
    screen === "manual_payments" &&
    !!selectedBank &&
    payments.length > 0;

  const addPayment = () => {
    if (!draftValid) return;
    setPayments((p) => [...p, { ...draft, id: crypto.randomUUID() }]);
    setDraft({ recipient: "", iban: "", amount: "", cycle: "monatlich" });
    setShowForm(false);
  };

  useEffect(() => {
    if (screen !== "auto_analyze" || !selectedBank) return;
    const t = window.setTimeout(() => {
      setFormData({
        oldBankName: selectedBank,
        oldIban: normalizeIban(DEMO_OLD_IBAN_INPUT),
        zahlungenManualRows: null,
        kontoauszugFotoHinterlegt: false,
      });
      nextStep();
    }, 2200);
    return () => window.clearTimeout(t);
  }, [screen, selectedBank, setFormData, nextStep]);

  const handleBack = () => {
    if (bankLoginOpen) {
      setBankLoginOpen(false);
      return;
    }
    switch (screen) {
      case "gfs_login":
        prevStep();
        break;
      case "choose_mode":
        setScreen("gfs_login");
        break;
      case "auto_bank":
        setMode(null);
        setSelectedBank(null);
        setScreen("choose_mode");
        break;
      case "manual_bank":
        setMode(null);
        setSelectedBank(null);
        setScreen("choose_mode");
        break;
      case "manual_payments":
        setScreen("manual_bank");
        break;
      default:
        break;
    }
  };

  const titleSubtitle = () => {
    switch (screen) {
      case "gfs_login":
        return {
          title: "Anmelden",
          subtitle:
            "Melden Sie sich mit Ihrem GFS-Konto an, um Ihr altes Bankkonto anzubinden.",
        };
      case "choose_mode":
        return {
          title: "Wie sollen wir Ihre Zahlungen erfassen?",
          subtitle:
            "Nach der Anmeldung wählen Sie, ob wir Daten automatisch von Ihrer Bank lesen oder ob Sie sie selbst eintragen.",
        };
      case "auto_bank":
        return {
          title: "Wählen Sie Ihre bisherige Bank",
          subtitle:
            "Anschließend melden Sie sich bei Ihrer Bank an (Demo). Wir lesen danach Ihre wiederkehrenden Zahlungen aus.",
        };
      case "auto_analyze":
        return {
          title: "Auswertung läuft",
          subtitle:
            "Wir werten Ihre Umsätze aus und bereiten die Zahlungsliste vor …",
        };
      case "manual_bank":
        return {
          title: "Wählen Sie Ihre bisherige Bank",
          subtitle:
            "Danach erfassen Sie Ihre wiederkehrenden Zahlungen in einer Eingabemaske.",
        };
      case "manual_payments":
        return {
          title: "Wiederkehrende Zahlungen",
          subtitle:
            selectedBank
              ? `Bank: ${selectedBank} — Tragen Sie Ihre Zahlungen ein.`
              : "Tragen Sie Ihre Zahlungen ein.",
        };
      default:
        return { title: "", subtitle: "" };
    }
  };

  const { title, subtitle } = titleSubtitle();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Ribbons />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.88_0.21_130/0.08)] blur-3xl" />

      <Dialog open={bankLoginOpen} onOpenChange={setBankLoginOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {selectedBank ? `Anmeldung bei ${selectedBank}` : "Bank-Anmeldung"}
            </DialogTitle>
            <DialogDescription>
              Demo: beliebige Nutzerkennung (min. 3 Zeichen) und PIN (min. 4
              Zeichen). Es findet keine echte Verbindung zur Bank statt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bank-user">Nutzerkennung / Vertragsnummer</Label>
              <Input
                id="bank-user"
                value={bankUserId}
                onChange={(e) => setBankUserId(e.target.value)}
                autoComplete="username"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-pin">PIN / Passwort</Label>
              <Input
                id="bank-pin"
                type="password"
                value={bankPin}
                onChange={(e) => setBankPin(e.target.value)}
                autoComplete="current-password"
                className="bg-background border-border"
              />
            </div>
            <Button
              type="button"
              className="w-full h-11 font-semibold bg-primary text-primary-foreground"
              disabled={!bankLoginCanSubmit}
              onClick={() => {
                setBankLoginOpen(false);
                setBankUserId("");
                setBankPin("");
                setScreen("auto_analyze");
              }}
            >
              Anmelden
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

        <main className="flex-1 px-5 sm:px-8 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {title}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[color:var(--tertiary)]">
                {subtitle}
              </p>
            </div>

            {screen === "gfs_login" && (
              <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5 max-w-lg mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="gfs-email">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="gfs-email"
                      type="email"
                      value={gfsEmail}
                      onChange={(e) => setGfsEmail(e.target.value)}
                      placeholder="name@beispiel.de"
                      className="pl-9 h-11 bg-background border-border"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gfs-pw">Passwort</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="gfs-pw"
                      type="password"
                      value={gfsPassword}
                      onChange={(e) => setGfsPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 h-11 bg-background border-border"
                      autoComplete="current-password"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Demo: E-Mail mit @ und Passwort mit mindestens 4 Zeichen.
                </p>
                <Button
                  type="button"
                  className="w-full h-12 font-semibold"
                  disabled={!gfsCanSubmit}
                  onClick={() => setScreen("choose_mode")}
                >
                  Anmelden
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {screen === "choose_mode" && (
              <>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <OptionCard
                    selected={mode === "auto"}
                    onClick={() => setMode("auto")}
                    icon={<Building2 className="h-6 w-6" />}
                    title="Automatisch"
                    description="Wir lesen Lastschriften und Daueraufträge nach Ihrer Bank-Anmeldung aus."
                    badge="Empfohlen"
                    accent="primary"
                  />
                  <OptionCard
                    selected={mode === "manual"}
                    onClick={() => setMode("manual")}
                    icon={<Pencil className="h-6 w-6" />}
                    title="Manuell"
                    description="Sie wählen Ihre Bank und tragen wiederkehrende Zahlungen selbst ein."
                    accent="muted"
                  />
                </div>
                <div className="mt-8">
                  <Button
                    type="button"
                    disabled={!canContinueMode}
                    onClick={() => {
                      if (mode === "auto") {
                        setSelectedBank(null);
                        setScreen("auto_bank");
                      } else if (mode === "manual") {
                        setSelectedBank(null);
                        setScreen("manual_bank");
                      }
                    }}
                    className={cn(
                      "w-full h-12 text-base font-semibold transition-all",
                      canContinueMode
                        ? "bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)] shadow-[0_8px_30px_-8px_oklch(0.88_0.21_130/0.6)] ring-1 ring-primary/40"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                    )}
                  >
                    Weiter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {(screen === "auto_bank" || screen === "manual_bank") && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
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

                {screen === "auto_bank" && selectedBank && (
                  <Button
                    type="button"
                    className="mt-8 w-full h-12 font-semibold bg-primary text-primary-foreground"
                    onClick={() => {
                      setBankUserId("");
                      setBankPin("");
                      setBankLoginOpen(true);
                    }}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Bei {selectedBank} anmelden
                  </Button>
                )}

                {screen === "manual_bank" && selectedBank && (
                  <Button
                    type="button"
                    className="mt-8 w-full h-12 font-semibold bg-primary text-primary-foreground"
                    onClick={() => setScreen("manual_payments")}
                  >
                    Weiter zur Eingabe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {screen === "auto_analyze" && (
              <div className="mt-16 flex flex-col items-center justify-center gap-6 text-center">
                <Loader2 className="h-14 w-14 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground max-w-sm">
                  Sichere Verbindung zu {selectedBank ?? "Ihrer Bank"} — Transaktionen
                  werden gelesen und Zahlungspartner erkannt …
                </p>
              </div>
            )}

            {screen === "manual_payments" && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Zahlungen erfassen
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

                <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/25 px-4 py-4 sm:px-5">
                  <p className="text-sm font-medium">Kontoauszug (optional)</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Sie können ein Foto oder einen Scan Ihres Auszugs anhängen. Auf dem
                    Smartphone öffnet „Foto aufnehmen“ in der Regel direkt die Kamera. Im
                    Prototyp wird das Bild nicht automatisch ausgelesen — die Zahlungen
                    tragen Sie wie gewohnt unten ein.
                  </p>

                  <input
                    ref={statementCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={handleStatementPhotoPick}
                  />
                  <input
                    ref={statementGalleryInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleStatementPhotoPick}
                  />

                  {!statementPhotoUrl ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => statementCameraInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4 shrink-0" />
                        Foto aufnehmen
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => statementGalleryInputRef.current?.click()}
                      >
                        <ImageIcon className="h-4 w-4 shrink-0" />
                        Aus Galerie / Datei
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="relative shrink-0 rounded-lg border border-border overflow-hidden bg-background max-w-[200px]">
                        <img
                          src={statementPhotoUrl}
                          alt="Vorschau Kontoauszug"
                          className="block w-full h-auto max-h-40 object-cover object-top"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {statementPhotoName ?? "Bild ausgewählt"}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/40 hover:bg-destructive/10"
                          onClick={clearStatementPhoto}
                        >
                          Foto entfernen
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {payments.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {payments.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/40 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.recipient}</div>
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
                            setPayments((list) => list.filter((x) => x.id !== p.id))
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

                {showForm && (
                  <div className="mt-5 rounded-xl border border-primary/40 bg-background/40 p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Zahlungsempfänger</Label>
                        <Input
                          id="recipient"
                          value={draft.recipient}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, recipient: e.target.value }))
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
                          onValueChange={(v) => setDraft((d) => ({ ...d, cycle: v }))}
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
                            <SelectItem value="halbjährlich">Halbjährlich</SelectItem>
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
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                        )}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Hinzufügen
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <Button
                    type="button"
                    disabled={!canManualFinish}
                    onClick={() => {
                      setFormData({
                        oldBankName: selectedBank ?? "",
                        oldIban: normalizeIban(DEMO_OLD_IBAN_INPUT),
                        zahlungenManualRows: manualPaymentsToZahlungRows(payments),
                        kontoauszugFotoHinterlegt: statementPhotoUrl !== null,
                      });
                      nextStep();
                    }}
                    className={cn(
                      "w-full h-12 text-base font-semibold",
                      canManualFinish
                        ? "bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)] shadow-[0_8px_30px_-8px_oklch(0.88_0.21_130/0.6)] ring-1 ring-primary/40"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                    )}
                  >
                    Weiter zu Zahlungen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {screen !== "auto_analyze" && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Zurück
                </button>
              </div>
            )}
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
