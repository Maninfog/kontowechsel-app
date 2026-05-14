# Kontowechsel-App (Prototyp)

Klickbarer **Kontowechsel-Service** (fiktive Marke „Global Finance Solutions“) für Studien-/Consulting-Demos: Nutzer führen neues Konto, altes Konto, Zahlungsauswahl, Prüfung und Übersicht durch. Bank-Anbindung, OCR und Partner-Benachrichtigung sind **bewusst simuliert**; ein kleines **Supabase**-Schema speichert Fall + Zahlungen beim Absenden.

## Tech-Stack

- **React 19**, **Vite 7**, **TanStack Router / Start**
- **Tailwind CSS 4**, **Radix UI**, **Supabase JS** (Browser-Client)
- Deployment: u. a. **Cloudflare** (Wrangler) / optional Vercel — siehe Projekt-Konfiguration

## Lokales Setup

```bash
npm install
# .env.local im Projektroot anlegen (siehe Tabelle unten)
npm run dev
```

### Umgebungsvariablen (`.env.local`)

| Variable | Beschreibung |
|----------|----------------|
| `VITE_SUPABASE_URL` | Projekt-URL, z. B. `https://xxxxx.supabase.co` (ohne `/rest/v1`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon** public key |

Ohne diese Werte läuft die App weiter; der **Absende-Button auf `/pruefen`** prüft die Konfiguration und zeigt eine Fehlermeldung, falls Supabase fehlt.

### Datenbank

SQL-Migration ausführen (Supabase → SQL Editor):

- `supabase/migrations/20250508120000_switching_cases_and_payments.sql`

Legt `switching_cases` und `payments` inkl. RLS-Policies für den **Prototyp** an (für Produktion Policies verschärfen).

## NPM-Skripte

| Befehl | Zweck |
|--------|--------|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Production-Build (Client + Server) |
| `npm run preview` | Build lokal testen |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## User-Flow (Kurz)

1. **Start** → Kunde: Einstieg (Name/E-Mail) · **Mitarbeiter:** `/mitarbeiter` (Login) → `/wechsel`  
2. **Wechsel** (`/wechsel`) → neues Konto (Inhaber, IBAN, Datum) — Texte unterscheiden sich leicht im Mitarbeiter-Modus  
3. **Altes Konto** (`/altes-konto`) → GFS-Login, dann **automatisch** (simulierte Bank-Analyse) oder **manuell** (Zahlungen erfassen, optional **Kontoauszug-Foto** Kamera/Galerie — nur UI, kein OCR)  
4. **Zahlungen** (`/zahlungen`) → Auswahl wiederkehrender Zahlungen; Demo-Liste + bei manuellem Pfad **zusätzlich** erfasste Zahlungen oben  
5. **Prüfen** (`/pruefen`) → Zusammenfassung, Checkbox, Speichern in Supabase  
6. **Fertig** / **Dashboard** → Abschluss bzw. Übersicht mit Demo-Status

Client-State: `src/store/useFlowStore.ts` (u. a. `zahlungenManualRows`, `kontoauszugFotoHinterlegt`, `identifikationsnachweisKundeHinterlegt`, **`flowActor`**: `customer` | `employee`).

### Kunde vs. Mitarbeiter (Prototyp)

| Einstieg | Ablauf |
|----------|--------|
| **Kunde** | `/start` (Name/E-Mail) → `/wechsel` → … → manuell oder automatisch am alten Konto |
| **Mitarbeiter** | `/mitarbeiter` → Login → `/wechsel` → … → **`/altes-konto`:** statt GFS-Kundenlogin zuerst **Kundenprofil** (Daten aus `/wechsel` + Vorgangsreferenz, optional **Identitätsnachweis** Ausweis/Pass als Foto) → dann wie gewohnt automatisch/manuell. |

Zwei komplett getrennte **Routen-Bäume** (`/kunde/...` vs. `/mitarbeiter/...`) lohnen sich für diesen Umfang **nicht**: gleiche Formulare, nur anderer Einstieg und Texte — daher **ein gemeinsamer Wizard** + `flowActor` für Copy und Rücknavigation.

## Was ist Demo, was ist „echt“?

- **Demo / Mock:** PSD2, echtes Bank-Login, OCR auf dem Kontoauszug, KI-Zuordnung in der Tiefe, Dashboard-Partnerstatus (Ampel), Verlaufstexte — alles **UI/Story**, keine Produktions-APIs.  
- **Echt (wenn Supabase konfiguriert):** `INSERT` in `switching_cases` und `payments` auf `/pruefen`.  
- **Hinweis:** `Payment.confidence` existiert im **Frontend-Typ** für die Auswahl-UI; in der SQL-Tabelle `payments` gibt es dafür **keine** Spalte.

## Repository

https://github.com/Maninfog/kontowechsel-app

---

*IT Consulting / Wirtschaftsinformatik — Prototyp KWS.*
