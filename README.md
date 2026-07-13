# Smart Application Projekt – Fitnessstudio-App

Solo-Projekt zur Verwaltung einer Fitnessstudio-App mit Mitgliedern, Tarifen, Kursen, Buchungen, Wartelisten, Trainerplänen, Online-Content und operativen Warnungen.

## Tech-Stack

- **Framework:** Next.js 14 (App Router) mit TypeScript
- **Datenbank:** SQLite via Prisma ORM
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js
- **Testing:** Vitest + Playwright

## Setup

```bash
# Projekt klonen
git clone <repo-url>
cd smart-application-projekt

# Abhängigkeiten installieren
npm install

# Datenbank initialisieren
npx prisma migrate dev

# Entwicklungsserver starten
npm run dev
```

## Dokumentation

- `docs/spec.md` – Fachliche Spezifikation
- `docs/architecture.md` – Datenmodell und Architektur
- `docs/backlog.md` – Feature-Backlog mit stabilen IDs (SMA-NNN)
- `docs/decisions.md` – Produkt- und Architekturentscheidungen

## Feature-IDs

Alle Features folgen dem Schema `SMA-NNN` und sind im Backlog dokumentiert.

## Projektstruktur

```
├── docs/              # Dokumentation (Single Source of Truth)
├── prisma/            # Prisma-Schema und Migrationen
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # Wiederverwendbare UI-Komponenten
│   ├── lib/           # Business-Logik und Hilfsfunktionen
│   └── types/         # TypeScript-Typen
└── tests/             # Tests (Vitest + Playwright)
```

## KI-unterstützte Entwicklung

Dieses Projekt wird mit Codex (OpenAI CLI) entwickelt. Die Konventionen sind in `AGENTS.md` festgehalten.
