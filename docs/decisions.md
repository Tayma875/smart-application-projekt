# Decisions - Smart Application Projekt

_Chronologisches Log aller Produkt- und Architekturentscheidungen._
_Stand: 2026-07-14_

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

## Offene Entscheidungen (aus SPEC Modell.md Widersprüche)

### Premium und No-Show-Sperre
**Betroffene Features:** `SMA-011`, `SMA-017`

Die Spec widerspricht sich: Einerseits automatische Sperre bei 3 No-Shows für alle,
andererseits für Premium-Mitglieder keine automatische Sperre, sondern nur Info an Admin.

Geloest am 2026-07-17: Premium ist von der automatischen Sperre ausgenommen; Admin erhaelt nur eine Benachrichtigung.

### Geburtstagskommunikation
**Betroffene Features:** `SMA-026`

Die Spec widerspricht sich: Einerseits automatische Geburtstagsnachricht an Mitglieder,
andererseits nur Admin-Erinnerung, damit Lisa selbst schreibt.

Geloest am 2026-07-17: Keine automatische Nachricht, nur Admin-Erinnerung fuer persoenliche Kontaktaufnahme.

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

## 2026-07-14 - Widersprüche aus SPEC Modell.md übernommen

**Kontext:** Die ursprüngliche `SPEC Modell.md` aus der Discovery enthielt zwei Widersprüche, die in `docs/spec.md` als offen markiert sind.

### Entscheidung
Die Widersprüche bleiben bestehen und werden bei Implementierung der betroffenen Features (SMA-017, SMA-026) durch Rückfrage an die Inhaberin geklärt. Keine stillschweigende Festlegung.

### Betroffene Features
- SMA-017: No-Show-Sperre Premium (automatisch vs. nur Info)
- SMA-026: Geburtstagsprozess (automatische Nachricht vs. Admin-Erinnerung)

## 2026-07-17 - Widersprüche aufgelöst: No-Show-Sperre Premium & Geburtstagskommunikation

**Kontext:** Die Spec enthielt zwei Widersprüche (Premium-No-Show-Sperre, Geburtstagsnachricht), die bis zur Klärung durch die Inhaberin offen waren. Lisa hat nun entschieden.

### Entscheidung No-Show-Sperre für Premium
Die automatische Sperre nach drei No-Shows gilt nur für Basic- und Plus-Mitglieder.
Premium-Mitglieder werden nicht automatisch gesperrt; Lisa erhält stattdessen eine
Benachrichtigung und entscheidet individuell.

### Entscheidung Geburtstagskommunikation
Das System verschickt keine automatische Geburtstagsnachricht. Es erinnert Lisa,
dass ein Mitglied Geburtstag hat. Lisa schreibt persönlich, um den persönlichen
Kontakt zu stärken und sich von großen Ketten abzuheben.

### Alternativen verworfen
- No-Show-Sperre für alle Tarife: Würde Premium-Vorteile untergraben.
- Automatische Geburtstagsnachricht: Zu unpersönlich für das Studio-Konzept.

### Konsequenzen
- SMA-017: Implementierung muss Premium von automatischer Sperre ausnehmen.
- SMA-026: Implementierung als Admin-Erinnerung, nicht als automatische Nachricht.
- docs/spec.md: Widersprüche markiert als gelöst.

## 2026-07-17 - Widersprüche aufgelöst: Wartelistenfrist & Basic Online-Zugang

**Kontext:** Die Spec enthielt zwei weitere offene Widersprüche (Wartelisten-Bestätigungsfrist, Online-Zugang für Basic). Lisa hat nun entschieden.

### Entscheidung Wartelisten-Bestätigungsfrist
Nachgerückte Mitglieder von der Warteliste haben 60 Minuten Zeit, die Buchung zu bestätigen. Bei Fristablauf verfällt der Anspruch und der nächste Platz auf der Warteliste rückt nach.

### Entscheidung Online-Zugang für Basic
Basic erhält eingeschränkten Online-Zugang: nur On-Demand-Videos, keine Live-Streams. Plus erhält Videos und Live-Streams. Premium alles unbegrenzt.

### Alternativen verworfen
- 30 Minuten Frist: Zu knapp für Mitglieder, die nicht sofort reagieren können.
- Basic ohne Online-Zugang: Würde Basic-Tarif im Vergleich zu Mitbewerbern unattraktiv machen.

### Konsequenzen
- SMA-014: Bestätigungslogik muss 60-Minuten-Frist implementieren (aktuell keine Frist).
- SMA-028: Basic-Online-Berechtigung in der Prüfung aktualisieren (eingeschränkt statt "kein" Zugang).
- docs/spec.md: Letzte zwei Widersprüche als gelöst markiert.
