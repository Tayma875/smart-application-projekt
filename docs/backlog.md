# Backlog - Smart Application Projekt

_Stand: 2026-07-14_

Stabile Feature-IDs. Nicht umnummerieren. Geloeschte oder verworfene IDs werden nicht wiederverwendet.

## Zweck

Dieses Dokument ist kein zweites Anforderungsdokument. Anforderungen stehen ausschliesslich in `docs/spec.md`. Der Backlog dient nur dazu, Umsetzungseinheiten stabil zu referenzieren.

## Konvention
- **ID-Schema:** `SMA-NNN`
- **Status:** `hypo`, `validated`, `in-progress`, `done`, `killed`
- **Quelle:** `spec.md` steht fuer die initiale Spezifikation.
- **Phase:** Grober Umsetzungsabschnitt fuer Sortierung im Solo-Projekt.

## Features

| ID | Name | Phase | Status | Quelle | Notiz |
|----|------|-------|--------|--------|-------|
| SMA-001 | Rollen- und Rechteverwaltung | 1 | done | spec.md | Auth.js + Login + Middleware + Dashboard; Admin, Rezeption, Trainer, Mitglied |
| SMA-002 | Mitgliederverwaltung | 1 | done | spec.md | CRUD + UI (Admin + Rezeption), Stammdaten, Status, Foto, Zahlungsstatus |
| SMA-003 | Tarifverwaltung | 1 | done | spec.md | CRUD + UI, Admin only; Basic, Plus, Premium, Preise, Laufzeit, Limits |
| SMA-004 | Mitglieds- und Tarifhistorie | 1 | done | spec.md | Automatische Historie bei Änderungen mit Start/Ende/Bemerkung |
| SMA-005 | Kursarten verwalten | 1 | done | spec.md | CRUD + UI, Admin only; Name, Kategorie, Level, Dauer, Voraussetzung |
| SMA-006 | Kurstermine planen | 1 | done | spec.md | CRUD + UI, Admin only; Datum, Uhrzeit, Raum, Trainer, Status |
| SMA-007 | Räume und Kapazitäten verwalten | 1 | done | spec.md | CRUD + UI, Admin only; Raumkapazität plus Kurslimit |
| SMA-008 | Trainerprofile und Qualifikationen | 1 | done | spec.md | CRUD + UI, Admin only; Spezialisierung, Beschäftigungsart, Kursqualifikation |
| SMA-009 | Mitglieder-Account | 1 | done | spec.md | 1:1 Login-Account für Mitglieder mit Buchungsseite und Übersicht |
| SMA-010 | Kursbuchung | 2 | done | spec.md | Buchung, 2h-Regel, Kapazität, Rezeptions-UI |
| SMA-011 | Storno mit Gebührenlogik | 2 | done | spec.md | 50% bei Storno <2h, Premium-Ausnahme |
| SMA-012 | Monatliche Buchungslimits | 2 | done | spec.md | Basic-Limit geprüft, Premium unbegrenzt |
| SMA-013 | Warteliste | 2 | done | spec.md | Max. 5 Personen, Wartelisten-API + UI |
| SMA-014 | Wartelisten-Nachrücken | 2 | done | spec.md | Automatisch bei Stornierung, keine Frist |
| SMA-015 | Anwesenheit für Trainer | 2 | done | spec.md | Trainer haken Teilnehmer ab |
| SMA-016 | No-Show-Warnung nach 2 Fehlzeiten | 2 | done | spec.md | Interne Admin-Warnung bei 2 No-Shows |
| SMA-017 | No-Show-Sperre nach 3 Fehlzeiten | 2 | done | spec.md | 2 Wochen Sperre nach 3 No-Shows |
| SMA-018 | Manuelle Entsperrung | 2 | done | spec.md | Admin-Entsperrbutton im UI |
| SMA-019 | Mitgliedschaft pausieren | 2 | done | spec.md | Max. 3 Monate pro Jahr, Prüfung |
| SMA-020 | Zahlung-ausstehend-Warnung | 2 | done | spec.md | Dashboard-Banner + Benachrichtigung bei Statuswechsel |
| SMA-021 | Trainerausfall-Warnung | 3 | done | spec.md | Warnung bei Status vertretung + Dashboard-Banner + Ersatztrainer via UI |
| SMA-022 | Kursabsage-Workflow | 3 | done | spec.md | Buchungen gebührenfrei storniert, Benachrichtigung an Mitglieder + Warteliste + Admin |
| SMA-023 | Kurserinnerungen | 3 | done | spec.md | API + Dashboard-Button für 24h- und 1h-Erinnerungen |
| SMA-024 | Auslastungswarnung bei 80 Prozent | 3 | done | spec.md | Automatische Admin-Warnung bei Buchung + Dashboard-Banner |
| SMA-025 | Vertrags-Monitoring | 3 | done | spec.md | API prüft auslaufende/abgelaufene Verträge + Dashboard-Button |
| SMA-026 | Geburtstagsprozess | 3 | validated | spec.md | Entscheidung: Admin-Erinnerung, keine automatische Nachricht (2026-07-17) |
| SMA-027 | Online-Content-Verwaltung | 4 | done | spec.md | CRUD + UI (Admin), Dashboard-Link |
| SMA-028 | Tarifbasierter Online-Zugang | 4 | done | spec.md | tarifVoraussetzung-Feld + Mitglieder-Filter (Basic/Plus/Premium) |
| SMA-029 | Advanced-Freigabe | 4 | done | spec.md | Admin-Freigabe pro Mitglied + Kategorie, Buchungsprüfung |
| SMA-030 | Advanced-Hinweis aus Teilnahmehistorie | 4 | done | spec.md | Admin sieht besuchte Mittel-Kurse bei Freigabe |
| SMA-031 | Honorartrainer-Abrechnung | 4 | done | spec.md | API + UI mit Zeitraumfilter, nur stattgefundene Termine |

## Workflow
- Neues Feature: naechste freie `SMA-NNN` vergeben.
- Implementierungsstart: Status auf `in-progress` setzen.
- Fertigstellung: Status auf `done` setzen und Commit/Version in der Notiz ergaenzen.
- Verworfen: Status auf `killed` setzen und Begruendung in `docs/decisions.md` dokumentieren.
