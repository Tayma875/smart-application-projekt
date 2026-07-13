# Decisions - Smart Application Projekt

_Chronologisches Log aller Produkt- und Architekturentscheidungen._
_Stand: 2026-06-26_

## 2026-06-26 - Modus-Operandi-Struktur fuer Solo-Projekt

**Kontext:** Das Projekt soll nach der Methodik `github.com/jacekzawisza/modus-operandi` eingerichtet werden, aber als Solo-Projekt.

### Entscheidung
Das Repo nutzt `AGENTS.md` als primaeres Agenten-Briefing und behaelt `CLAUDE.md` als kompatiblen Verweis. Die zentrale Doku liegt in `docs/`:

- `docs/spec.md`
- `docs/architecture.md`
- `docs/backlog.md`
- `docs/decisions.md`

### Alternativen verworfen
- Team-Mission-Dokumente: fuer Solo-Projekt nicht noetig.
- `docs/INBOX.md`: fuer sequenzielles Solo-Arbeiten nicht noetig; kann bei parallelen Worktrees nachgeruestet werden.
- `docs/prd.md`: nicht noetig, weil die fachlichen Anforderungen vollstaendig in `docs/spec.md` gepflegt werden.
- `docs/meetings/` und `docs/results/`: fuer dieses Solo-Projekt nicht gewuenscht.

### Konsequenzen
- KI-Sessions koennen sich schnell am Projektkontext orientieren.
- Entscheidungen und Widersprueche werden explizit statt implizit behandelt.
- `docs/spec.md` bleibt die einzige Quelle fuer Anforderungen.
- Backlog-IDs koennen gepflegt werden, sobald Features umgesetzt oder verworfen werden.

## Offene Entscheidungen

### Wartelisten-Bestaetigungsfrist
**Betroffene Features:** `SMA-014`

Offen: Gilt fuer Nachruecker eine Frist von 30 oder 60 Minuten?

### Premium und No-Show-Sperre
**Betroffene Features:** `SMA-011`, `SMA-017`

Offen: Sind Premium-Mitglieder nur von Spaetstorno-Gebuehren ausgenommen oder auch von automatischen No-Show-Sperren?

### Basic und Online-Zugang
**Betroffene Features:** `SMA-028`

Offen: Erhaelt Basic gar keinen Online-Zugang oder einen eingeschraenkten Zugriff?

### Geburtstagskommunikation
**Betroffene Features:** `SMA-026`

Offen: Soll das System automatisch an Mitglieder schreiben oder nur die Inhaberin erinnern?

### Tech-Stack
**Betroffene Features:** alle

Offen: Framework, Datenbank, Auth, Hosting und Benachrichtigungsanbieter sind noch nicht entschieden.

<!-- Vorlage fuer neue Entscheidungen:

## JJJJ-MM-TT - Titel

**Kontext:** Warum mussten wir entscheiden?

### Entscheidung
Was wurde entschieden?

### Alternativen verworfen
- Option A: Warum nicht?
- Option B: Warum nicht?

### Konsequenzen
- Positiv
- Negativ / Risiken

-->

## 2026-07-13 - Tech-Stack-Entscheidung

**Kontext:** Das Projekt benötigt einen Tech-Stack, der lokal lauffähig ist, schnell entwickelt werden kann und für eine Fitnessstudio-Verwaltungsapp geeignet ist.

### Entscheidung
- **Framework:** Next.js 14 (App Router) mit TypeScript
- **Datenbank:** SQLite via Prisma ORM
- **UI:** Tailwind CSS + shadcn/ui für schnelle Oberflächen
- **Auth:** NextAuth.js für Rollen-basierte Authentifizierung (Admin, Rezeption, Trainer, Mitglied)
- **Testing:** Vitest für Unit-Tests, Playwright für E2E-Tests
- **Hosting:** Lokal (Entwicklung), später optional Vercel

Begründung: Next.js bietet SSR, API-Routes und TypeScript-Unterstützung out of the box. Prisma mit SQLite erlaubt schema-first Entwicklung ohne externen Datenbankserver. shadcn/ui liefert kopierbare Komponenten statt schwerer Abhängigkeiten.

### Alternativen verworfen
- **React + Express + separate API:** Mehr Komplexität ohne Mehrwert für ein Solo-Projekt.
- **Python/Django:** Möglich, aber Next.js/TypeScript passt besser zur modernen Webentwicklung und shadcn/ui-Ökosystem.
- **MongoDB:** Kein Vorteil für stark relationales Datenmodell (Mitglieder, Buchungen, Tarife).
- **Supabase/Firebase:** Zu viele externe Dienste für ein lokales Projekt; SQLite hält alles einfach.

### Konsequenzen
- Schema-first mit Prisma → Datenmodell wird direkt aus `docs/spec.md` und `docs/architecture.md` abgeleitet.
- App Router erlaubt klare Trennung von Server- und Client-Komponenten.
- SQLite braucht keine separate Datenbank-Installation.
- Tailwind + shadcn/ui minimiert CSS-Arbeit bei gleichzeitig professionellem Look.
