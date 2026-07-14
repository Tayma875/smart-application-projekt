---
name: smart-application-projekt-agent
description: >
  Automatisierte, vollständige Umsetzung einer Fitnessstudio-Verwaltungsapp
  basierend auf dem SMA-Backlog. Verwende diesen Skill, wenn Codex die
  Fitnessstudio-App (Mitglieder, Tarife, Kurse, Buchungen, Wartelisten,
  Trainer, Online-Content, Warnungen) eigenständig implementieren, testen
  und voranbringen soll. Aktiviere den Skill bei jeder Aufgabe, die ein
  SMA-Backlog-Item betrifft — von Phase 1 (Stammdaten) bis Phase 4
  (Online-Content, Advanced-Freigabe, Honorarabrechnung). Der Skill stellt
  sicher, dass Codex vor der Umsetzung docs/spec.md, docs/backlog.md,
  docs/architecture.md und docs/decisions.md konsultiert, offene
  Entscheidungen nicht stillschweigend trifft und die AGENTS.md-Regeln
  einhält. Enthält Skripte für Datenbank-Migration, Seed-Daten,
  Build-Prüfung und Backlog-Status-Updates.
---

# Smart Application Projekt Agent

## Überblick

Dieser Skill befähigt Codex, die Fitnessstudio-App unter
`/Users/tayma/Documents/smart-application-projekt` vollständig und
eigenständig zu implementieren. Die fachliche Grundlage ist `docs/spec.md`,
der Fortschritt wird in `docs/backlog.md` verfolgt.

---

## Arbeitsweise

### Vor jeder Implementierung

1. **Dokumente konsultieren:** `docs/spec.md`, `docs/backlog.md`,
   `docs/architecture.md`, `docs/decisions.md` und `AGENTS.md` lesen.
2. **Feature-ID referenzieren:** Das betroffene SMA-NNN aus `docs/backlog.md`
   identifizieren.
3. **Erfolgskriterien konkretisieren:** Klare Annahmen/Akzeptanzkriterien notieren,
   bevor Code geschrieben wird.
4. **Offene Entscheidungen prüfen:** Bei Widersprüchen in `docs/decisions.md`
   nachschlagen; wenn dort keine Klärung, den Nutzer fragen — keine
   stillschweigenden Produktentscheidungen.

### Während der Implementierung

- **Surgical changes:** Nur das konkrete Feature bauen, keinen Scope erweitern.
- **Simplicity first:** Nicht mehr bauen als nötig.
- **Dokumentation mitziehen:** Wenn neue Erkenntnisse entstehen, in
  `docs/decisions.md` festhalten.
- **Projektkonventionen einhalten:** Deutsche UI-Texte, Feature-ID-Prefix `SMA`,
  Commit-Referenzen mit Feature-ID.
- **Bekannte Fallen beachten:**
  - `Kurs` ≠ `Kurstermin` (Kurs ist die Art, Kurstermin die Durchführung).
  - Kapazität = min(Kurslimit, Raumkapazität).
  - No-Show-Zähler zählt aufeinanderfolgende Fehlzeiten.
  - Zahlung ausstehend → Warnung, keine Sperre.
  - Honorartrainer sehen nur stattgefundene Termine.

### Nach der Implementierung

- Backlog-Status in `docs/backlog.md` von `in-progress` auf `done` setzen.
- Eine kurze Notiz ergänzen (z. B. Commit-Hash oder PR-Referenz).
- `docs/decisions.md` aktualisieren, falls eine neue Entscheidung getroffen wurde.
- `docs/architecture.md` aktualisieren, falls das Datenmodell oder die
  Systemarchitektur betroffen ist.

---

## Phasen und Reihenfolge

### Phase 0.5 — Datenbank & Grundlage startklar machen
- `prisma migrate dev` ausführen → SQLite-Datenbank erzeugen.
- `prisma/seed.ts` schreiben: Tarife (Basic/Plus/Premium), Beispielräume,
  Beispielkurse, Admin-/Rezeption-/Trainer-/Mitglied-Accounts.
- App lokal starten (`npm run dev`) und verifizieren.

### Phase 1 — Kernmodell und Stammdaten (SMA-001 bis SMA-009)
| ID | Feature |
|----|---------|
| SMA-001 | Rollen- und Rechteverwaltung + Auth (Auth.js) |
| SMA-002 | Mitgliederverwaltung (CRUD + UI) |
| SMA-003 | Tarifverwaltung (CRUD + UI) |
| SMA-004 | Mitglieds- und Tarifhistorie |
| SMA-005 | Kursarten verwalten (CRUD + UI) |
| SMA-006 | Kurstermine planen (CRUD + UI) |
| SMA-007 | Räume und Kapazitäten verwalten |
| SMA-008 | Trainerprofile + Qualifikationen |
| SMA-009 | Mitglieder-Accounts (Login) |

### Phase 2 — Buchungen, Regeln, Anwesenheit (SMA-010 bis SMA-020)
| ID | Feature |
|----|---------|
| SMA-010 | Kursbuchung (2h-Regel, Kapazität) |
| SMA-011 | Storno mit Gebührenlogik (50%, Premium offen) |
| SMA-012 | Monatliche Buchungslimits |
| SMA-013 | Warteliste (max. 5) |
| SMA-014 | Wartelisten-Nachrücken (Frist offen) |
| SMA-015 | Anwesenheit für Trainer |
| SMA-016 | No-Show-Warnung nach 2 Fehlzeiten |
| SMA-017 | No-Show-Sperre nach 3 (Premium offen) |
| SMA-018 | Manuelle Entsperrung |
| SMA-019 | Mitgliedschaft pausieren (max. 3 Monate/J.) |
| SMA-020 | Zahlung-ausstehend-Warnung |

### Phase 3 — Warnungen, Kommunikation, Monitoring (SMA-021 bis SMA-026)
| ID | Feature |
|----|---------|
| SMA-021 | Trainerausfall-Warnung |
| SMA-022 | Kursabsage-Workflow |
| SMA-023 | Kurserinnerungen (24h + 1h) |
| SMA-024 | Auslastungswarnung bei 80% |
| SMA-025 | Vertrags-Monitoring |
| SMA-026 | Geburtstagsprozess (Entscheidung offen) |

### Phase 4 — Online-Content, Advanced, Abrechnung (SMA-027 bis SMA-031)
| ID | Feature |
|----|---------|
| SMA-027 | Online-Content-Verwaltung |
| SMA-028 | Tarifbasierter Online-Zugang (Basic offen) |
| SMA-029 | Advanced-Freigabe |
| SMA-030 | Advanced-Hinweis aus Teilnahmehistorie |
| SMA-031 | Honorartrainer-Abrechnung |

**Wichtig:** Nie die Phase überspringen — immer mit dem ersten noch nicht
abgeschlossenen Feature beginnen.

---

## Offene Entscheidungen (nie stillschweigend festlegen)

- **Wartelisten-Bestätigungsfrist** (SMA-014): 30 oder 60 Minuten?
- **Premium & No-Show-Sperre** (SMA-011, SMA-017): Premium nur von
  Stornogebühren befreit oder auch von automatischer Sperre?
- **Basic & Online-Zugang** (SMA-028): Basic gar kein Online-Zugang oder
  eingeschränkter Zugriff?
- **Geburtstagskommunikation** (SMA-026): Automatisch oder
  Admin-Erinnerung?

Wenn eines dieser Features umgesetzt werden soll und der Nutzer noch keine
Entscheidung getroffen hat: **stoppen und nachfragen.**

---

## Tech-Stack (entschieden am 2026-07-13 in docs/decisions.md)

- **Framework:** Next.js 14 (App Router) mit TypeScript
- **Datenbank:** SQLite via Prisma ORM
- **UI:** Tailwind CSS (v4) + shadcn/ui
- **Auth:** Auth.js (NextAuth.js v5) für rollenbasierte Authentifizierung
- **Testing:** Vitest (Unit) + Playwright (E2E) — optional
- **Hosting:** Lokal (`npm run dev`)

## Datenmodell (Prisma-Schema existiert)

Das vollständige Schema liegt in `prisma/schema.prisma` mit allen 14 Modellen:
Account, Mitglied, MitgliedsHistorie, Tarif, Kurs, Kurstermin, Trainer,
TrainerKurs, Raum, Buchung, WartelistenEintrag, OnlineContent,
AdvancedFreigabe, Benachrichtigung.

**Vor Phase-1-Arbeiten prüfen, ob das Schema noch aktuell ist.**
Bei Schema-Änderungen: `docs/architecture.md` aktualisieren.

---

## Hilfsskripte

### `scripts/status.sh`
Zeigt den aktuellen Backlog-Fortschritt an.

### `scripts/set-status.sh`
Setzt ein Backlog-Item auf einen bestimmten Status:
```bash
scripts/set-status.sh SMA-001 done
```

### `scripts/run-dev.sh`
Startet die App im Entwicklungsmodus.

### `scripts/run-migration.sh`
Führt Prisma-Migration und Seed aus.

### `scripts/next-feature.sh`
Ermittelt das nächste zu implementierende Feature aus dem Backlog.

---

## Referenzen

### `references/feature-template.md`
Vorlage mit Checkliste für die konsistente Umsetzung eines einzelnen
SMA-Features: Lesen → Planen → Bauen → Testen → Status-Update.

### `references/decision-log.md`
Hilfestellung, wann und wie eine Entscheidung in `docs/decisions.md`
mit Datum, Kontext, Entscheidung, Alternativen und Konsequenzen
festgehalten wird.

---

## Wichtige Pfade

- Projektstamm: `/Users/tayma/Documents/smart-application-projekt`
- Skill-Stamm: `_agent/` (dieses Verzeichnis)
- Prisma-Schema: `prisma/schema.prisma`
- Seed-Datei: `prisma/seed.ts`
- Dokumentation: `docs/`
