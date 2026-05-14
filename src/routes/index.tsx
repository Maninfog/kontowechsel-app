import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/Stepper";
import { Lock, ShieldCheck, Landmark } from "lucide-react";
import { normalizeIban } from "@/lib/iban";
import { zahlungRowToStorePayment } from "@/lib/map-zahlung-row";
import { DEMO_PAYMENTS } from "@/data/demo-payments";
import { useFlowStore } from "@/store/useFlowStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Global Finance Solutions — Ihr Kontowechsel in 5 Minuten" },
      {
        name: "description",
        content:
          "Wechseln Sie Ihr Bankkonto in 5 Minuten. Wir übernehmen die komplette Abwicklung – digital, sicher und BaFin-reguliert.",
      },
      {
        property: "og:title",
        content: "Global Finance Solutions — Ihr Kontowechsel in 5 Minuten",
      },
      {
        property: "og:description",
        content: "Digitaler Kontowechsel-Service. SSL-verschlüsselt, DSGVO-konform, BaFin-reguliert.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { resetFlow, setFormData } = useFlowStore();

  const startDemo = () => {
    setFormData({
      customerName: "Anna Müller",
      newIban: normalizeIban("DE89 3704 0044 0532 0130 00"),
      newBankName: "Deutsche Bank",
      switchDate: "2026-06-01",
      oldIban: normalizeIban("DE12 3456 7890 1234 5678 90"),
      oldBankName: "Sparkasse München",
      selectedPayments: DEMO_PAYMENTS.map((p) => zahlungRowToStorePayment(p, true)),
      noPaymentsSelected: false,
      zahlungenManualRows: null,
      kontoauszugFotoHinterlegt: false,
    });
    navigate({ to: "/wechsel" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Decorative ribbons (top-right) */}
      <Ribbons />

      {/* Soft glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[oklch(0.88_0.21_130/0.08)] blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="px-5 sm:px-8 py-5">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm sm:text-base font-semibold tracking-tight">
                Global Finance Solutions
              </span>
            </div>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Sicher · Digital · BaFin-reguliert
            </span>
          </div>
        </header>

        {/* Stepper */}
        <div className="px-5 sm:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-5">
            <Stepper currentStep={0} />
          </div>
        </div>

        {/* Hero */}
        <main className="flex-1 px-5 sm:px-8 py-12 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Kontowechsel-Service
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Ihr Kontowechsel <br className="hidden sm:block" />
              in <span className="text-primary">5 Minuten</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[color:var(--tertiary)] max-w-xl mx-auto">
              Wir übernehmen die komplette Abwicklung – digital und sicher.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="h-12 px-7 text-base font-semibold bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)] shadow-[0_8px_30px_-8px_oklch(0.88_0.21_130/0.5)]"
              >
                <Link to="/start" onClick={() => resetFlow()}>
                  Jetzt Konto wechseln
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-7 text-base font-semibold border-2 border-primary text-foreground bg-transparent hover:bg-primary/10 hover:text-foreground"
              >
                <Link to="/mitarbeiter">Als Mitarbeiter anmelden</Link>
              </Button>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={startDemo}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Demo starten
              </Button>
            </div>
          </div>
        </main>

        {/* Trust bar */}
        <footer className="px-5 sm:px-8 pb-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <TrustItem icon={<Lock className="h-5 w-5" />} label="SSL-verschlüsselt" />
            <TrustItem icon={<ShieldCheck className="h-5 w-5" />} label="DSGVO-konform" />
            <TrustItem icon={<Landmark className="h-5 w-5" />} label="BaFin-reguliert" />
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Global Finance Solutions
          </p>
        </footer>
      </div>
    </div>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-4">
      <span className="text-foreground">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function Ribbons() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -top-20 -right-20 h-[480px] w-[480px] sm:h-[640px] sm:w-[640px] opacity-80"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8E63D" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8E63D" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C840" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8C840" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="rg3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0A0B8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F0A0B8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M-50 220 C 120 80, 320 80, 520 240 S 720 460, 560 560"
        stroke="url(#rg1)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M-30 300 C 160 160, 360 160, 560 320 S 760 540, 600 640"
        stroke="url(#rg2)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 160 C 200 40, 400 60, 580 200 S 760 420, 620 520"
        stroke="url(#rg3)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
