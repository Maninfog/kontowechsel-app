import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Mail, User } from "lucide-react";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Konto wechseln — Global Finance Solutions" },
      {
        name: "description",
        content: "Starten Sie Ihren digitalen Kontowechsel in wenigen Minuten.",
      },
    ],
  }),
  component: StartPage,
});

function StartPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);

  const canSubmit = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && agreed;

  return (
    <AuthShell
      title="Kontowechsel starten"
      subtitle="Geben Sie Ihre Daten ein – wir führen Sie sicher durch alle 5 Schritte."
      footer={
        <>
          Sie sind Mitarbeiter?{" "}
          <Link to="/mitarbeiter" className="text-primary font-medium hover:underline">
            Hier anmelden
          </Link>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          navigate({ to: "/wechsel" });
        }}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Vor- und Nachname</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Max Mustermann"
              autoComplete="name"
              className="pl-9 h-11 bg-background border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-Mail-Adresse</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@beispiel.de"
              autoComplete="email"
              className="pl-9 h-11 bg-background border-border"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer">
          <Checkbox
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary"
          />
          <span>
            Ich stimme der{" "}
            <span className="text-foreground underline">Datenschutzerklärung</span>{" "}
            und den{" "}
            <span className="text-foreground underline">AGB</span> zu.
          </span>
        </label>

        <Button
          type="submit"
          disabled={!canSubmit}
          className={[
            "w-full h-12 text-base font-semibold transition-all",
            canSubmit
              ? "bg-primary text-primary-foreground hover:bg-[color:var(--primary-hover)] shadow-[0_8px_30px_-8px_oklch(0.88_0.21_130/0.6)] ring-1 ring-primary/40"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-60 hover:bg-muted",
          ].join(" ")}
        >
          Kontowechsel starten
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          🔒 SSL-verschlüsselt · DSGVO-konform · BaFin-reguliert
        </p>
      </form>
    </AuthShell>
  );
}
