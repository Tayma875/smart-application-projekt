# Smart Fitness – Verwaltungs-App

Solo-Projekt einer Fitnessstudio-App zur Verwaltung von Mitgliedern, Tarifen, Kursen, Buchungen, Wartelisten, Trainerplänen, Online-Content und operativen Warnungen.

## Tech-Stack

- **Framework:** Next.js 14 (App Router) mit TypeScript
- **Datenbank:** SQLite via Prisma ORM
- **UI:** Tailwind CSS 4 + shadcn/ui
- **Auth:** Auth.js (NextAuth v5) – Credentials-Provider
- **Testing:** Vitest (Unit-Tests)

## Schnellstart

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen (einmalig)
cp .env.example .env
# NEXTAUTH_SECRET durch einen zufälligen Wert ersetzen

# 3. Datenbank erstellen und befüllen
npm run db:migrate
npm run db:seed

# 4. Entwicklungsserver starten
npm run dev
```

Die App läuft dann unter `http://localhost:5558`.

## Test-Zugänge

| E-Mail | Rolle | Passwort |
|---|---|---|
| lisa@smart-fitness.de | Admin | admin123 |
| rezeption@smart-fitness.de | Rezeption | rezeption123 |
| trainer@smart-fitness.de | Trainer (Marie) | trainer123 |
| tom@smart-fitness.de | Trainer (Tom) | trainer123 |
| max@example.com | Mitglied (Basic) | mitglied123 |
| anna@example.com | Mitglied (Premium) | mitglied123 |

## Tests ausführen

```bash
npm test            # Vitest (Unit-Tests)
npm run test:watch  # Watch-Modus
```

## Projektstruktur

```
├── __tests__/         # Unit-Tests (Vitest)
├── _agent/            # KI-Agenten-Skill und Skripte
├── docs/              # Dokumentation (Single Source of Truth)
│   ├── spec.md        # Fachliche Spezifikation
│   ├── architecture.md# Datenmodell und Architektur
│   ├── backlog.md     # Feature-Backlog (SMA-NNN)
│   └── decisions.md   # Produkt- und Architekturentscheidungen
├── prisma/            # Prisma-Schema, Migrationen, Seed
├── public/            # Statische Assets
├── src/
│   ├── app/           # Next.js App Router (Seiten + API-Routen)
│   ├── components/    # Wiederverwendbare UI-Komponenten
│   └── lib/           # Prisma-Client, Auth, Helfer
└── package.json
```

## Datenbank-Befehle

```bash
npm run db:generate   # Prisma Client generieren
npm run db:migrate    # Migration ausführen
npm run db:studio     # Prisma Studio (GUI) öffnen
npm run db:seed       # Datenbank mit Demodaten befüllen
```

## Feature-IDs (SMA-NNN)

Alle 31 Features sind im Backlog (`docs/backlog.md`) dokumentiert und umgesetzt:

- **Phase 1:** Rollen, Mitglieder, Tarife, Kurse, Termine, Räume, Trainer
- **Phase 2:** Buchungen, Storno, Limits, Warteliste, Anwesenheit, No-Show
- **Phase 3:** Warnungen, Erinnerungen, Auslastung, Verträge, Geburtstage
- **Phase 4:** Online-Content, Advanced-Freigabe, Honorar-Abrechnung

## Entwicklung mit Codex

Die `AGENTS.md` und `_agent/SKILL.md` definieren die Arbeitsweise für die KI-gestützte Entwicklung. Hilfsskripte in `_agent/scripts/` unterstützen bei Status-Tracking und DB-Operationen.

```bash
_agent/scripts/status.sh          # Backlog-Fortschritt anzeigen
_agent/scripts/next-feature.sh    # Nächstes Feature ermitteln
_agent/scripts/run-migration.sh   # Migration + Seed
```

## Deployment

### Lokal (Entwicklung)
```bash
npm run build    # Produktions-Build
npm run start    # Produktions-Server starten
```

### Vercel (Produktion)

> **Hinweis:** SQLite funktioniert nicht auf Vercel (serverless). Für ein Vercel-Deployment muss die Datenbank auf PostgreSQL umgestellt werden.

1. Konto auf [vercel.com](https://vercel.com) erstellen
2. PostgreSQL-Datenbank bereitstellen (z. B. [Neon](https://neon.tech) oder [Supabase](https://supabase.com))
3. `prisma/schema.prisma` anpassen: `datasource db { provider = "postgresql" }`
4. Umgebungsvariablen in Vercel setzen:
   - `DATABASE_URL` – PostgreSQL-Verbindungsstring
   - `NEXTAUTH_SECRET` – zufälliger Secret-String
   - `NEXTAUTH_URL` – URL der App (z. B. `https://smart-fitness.vercel.app`)
5. Repository auf Vercel importieren
6. `vercel.json` ist bereits vorbereitet

### Docker (Alternative)

```bash
docker build -t smart-fitness .
docker run -p 5558:5558 smart-fitness
```
