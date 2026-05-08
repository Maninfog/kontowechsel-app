import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Lock, Building2 } from "lucide-react";

export const Route = createFileRoute("/mitarbeiter")({
  head: () => ({
    meta: [
      { title: "Mitarbeiter-Login — Global Finance Solutions" },
      {
        name: "description",
        content: "Interner Zugang für Mitarbeiter von Global Finance Solutions.",
      },
    ],
  }),
  component: MitarbeiterPage,
});

function MitarbeiterPage() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit =
    employeeId.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 6;

  return (
    <AuthShell
      title="Mitarbeiter-Anmeldung"
      subtitle="Interner Zugang für autorisierte Mitarbeiter."
      footer={
        <>
          Sind Sie Kunde?{" "}
          <Link to="/start" className="text-primary font-medium hover:underline">
            Kontowechsel starten
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
          <Label htmlFor="empId">Mitarbeiter-ID</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="empId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="GFS-12345"
              autoComplete="username"
              className="pl-9 h-11 bg-background border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Geschäftliche E-Mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m.mueller@gfs.de"
              autoComplete="email"
              className="pl-9 h-11 bg-background border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Passwort</Label>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Passwort vergessen?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-9 h-11 bg-background border-border"
            />
          </div>
        </div>

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
          Anmelden
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Geschützter interner Bereich · 2FA aktiviert
        </p>
      </form>
    </AuthShell>
  );
}
