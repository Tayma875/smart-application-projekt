# Backlog - Smart Application Projekt

_Stand: 2026-06-26_

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
| SMA-001 | Rollen- und Rechteverwaltung | 1 | hypo | spec.md | Admin, Rezeption, Trainer, Mitglied |
| SMA-002 | Mitgliederverwaltung | 1 | hypo | spec.md | Stammdaten, Status, Foto, Zahlungsstatus |
| SMA-003 | Tarifverwaltung | 1 | hypo | spec.md | Basic, Plus, Premium, Preise, Laufzeit, Limits |
| SMA-004 | Mitglieds- und Tarifhistorie | 1 | hypo | spec.md | Historie mit Start/Ende/Bemerkung |
| SMA-005 | Kursarten verwalten | 1 | hypo | spec.md | Name, Kategorie, Level, Dauer, Voraussetzung |
| SMA-006 | Kurstermine planen | 1 | hypo | spec.md | Datum, Uhrzeit, Raum, Trainer, Status |
| SMA-007 | Raeume und Kapazitaeten verwalten | 1 | hypo | spec.md | Raumkapazitaet plus Kurslimit |
| SMA-008 | Trainerprofile und Qualifikationen | 1 | hypo | spec.md | Spezialisierung, Beschaeftigungsart, Kursqualifikation |
| SMA-009 | Mitglieder-Account | 1 | hypo | spec.md | 1:1 Login-Account fuer Mitglieder |
| SMA-010 | Kursbuchung | 2 | hypo | spec.md | Buchung bis 2 Stunden vor Beginn |
| SMA-011 | Storno mit Gebuehrenlogik | 2 | hypo | spec.md | 50 Prozent bei Spaetstorno, Premium-Ausnahme offen |
| SMA-012 | Monatliche Buchungslimits | 2 | hypo | spec.md | Basic begrenzt, Premium unbegrenzt |
| SMA-013 | Warteliste | 2 | hypo | spec.md | Maximal 5 Personen pro Termin |
| SMA-014 | Wartelisten-Nachruecken | 2 | hypo | spec.md | Bestaetigungsfrist offen: 30 vs. 60 Minuten |
| SMA-015 | Anwesenheit fuer Trainer | 2 | hypo | spec.md | Trainer haken Teilnehmer ab |
| SMA-016 | No-Show-Warnung nach zwei Fehlzeiten | 2 | hypo | spec.md | Interne Admin-Warnung |
| SMA-017 | No-Show-Sperre nach drei Fehlzeiten | 2 | hypo | spec.md | Zwei Wochen Live-Buchungssperre; Premium-Ausnahme offen |
| SMA-018 | Manuelle Entsperrung | 2 | hypo | spec.md | Admin kann Sperre begruendet aufheben |
| SMA-019 | Mitgliedschaft pausieren | 2 | hypo | spec.md | Maximal 3 Monate pro Jahr |
| SMA-020 | Zahlung-ausstehend-Warnung | 2 | hypo | spec.md | Warnung ohne automatische Sperre |
| SMA-021 | Trainerausfall-Warnung | 3 | hypo | spec.md | Nur Admin sichtbar, Ersatztrainer moeglich |
| SMA-022 | Kursabsage-Workflow | 3 | hypo | spec.md | Admin markiert abgesagt, danach Storno und Benachrichtigung |
| SMA-023 | Kurserinnerungen | 3 | hypo | spec.md | 24h und 1h vor Kursbeginn |
| SMA-024 | Auslastungswarnung bei 80 Prozent | 3 | hypo | spec.md | Admin kann Zusatztermine pruefen |
| SMA-025 | Vertrags-Monitoring | 3 | hypo | spec.md | Auslaufende/abgelaufene Mitgliedschaften |
| SMA-026 | Geburtstagsprozess | 3 | hypo | spec.md | Entscheidung offen: automatisch schreiben oder Admin erinnern |
| SMA-027 | Online-Content-Verwaltung | 4 | hypo | spec.md | Live-Streams, On-Demand-Videos, Kursbezug |
| SMA-028 | Tarifbasierter Online-Zugang | 4 | hypo | spec.md | Basic/Plus/Premium-Regel final klaeren |
| SMA-029 | Advanced-Freigabe | 4 | hypo | spec.md | Manuelle Freigabe pro Mitglied und Kategorie |
| SMA-030 | Advanced-Hinweis aus Teilnahmehistorie | 4 | hypo | spec.md | Hinweis auf besuchte Mittel-Kurse |
| SMA-031 | Honorartrainer-Abrechnung | 4 | hypo | spec.md | Zeitraum, Datum, Kursname, Dauer, nur stattgefunden |

## Workflow
- Neues Feature: naechste freie `SMA-NNN` vergeben.
- Implementierungsstart: Status auf `in-progress` setzen.
- Fertigstellung: Status auf `done` setzen und Commit/Version in der Notiz ergaenzen.
- Verworfen: Status auf `killed` setzen und Begruendung in `docs/decisions.md` dokumentieren.
