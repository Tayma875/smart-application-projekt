# AGENTS.md - Smart Application Projekt

## Projekt
Solo-Projekt fuer eine Fitnessstudio-App zur Verwaltung von Mitgliedern, Tarifen, Kursen, Buchungen, Wartelisten, Trainerplaenen, Online-Content und operativen Warnungen.

Die fachliche Grundlage ist ausschliesslich `docs/spec.md`. Bei Widerspruechen nicht raten: offene Punkte in `docs/decisions.md` klaeren oder als Frage an den Nutzer markieren.

## Arbeitsweise
Dieses Repo folgt einer Solo-Variante von Modus Operandi:

- Markdown im Repo ist die Single Source of Truth.
- `docs/spec.md` ist die normalisierte fachliche Ausgangsspezifikation.
- `docs/backlog.md` ist nur ein operatives Umsetzungsregister mit stabilen IDs; Anforderungen stehen in `docs/spec.md`.
- `docs/architecture.md` enthaelt Datenmodell, Rollen, Systemgrenzen und technische Annahmen.
- `docs/decisions.md` ist das chronologische Log fuer Produkt- und Architekturentscheidungen.

## Vor jeder Umsetzung
1. Relevante Abschnitte in `docs/spec.md`, `docs/backlog.md`, `docs/architecture.md` und `docs/decisions.md` lesen.
2. Betroffene Feature-ID aus `docs/backlog.md` referenzieren oder eine neue ID vergeben.
3. Erfolgskriterien vor der Implementierung konkretisieren.
4. Bei unklaren Regeln stoppen und nachfragen, statt implizite Produktentscheidungen zu treffen.

## Coding-Prinzipien
- Think before coding: Annahmen explizit machen.
- Simplicity first: nur bauen, was fuer die konkrete Anforderung noetig ist.
- Surgical changes: keine unaufgeforderten Refactorings oder Scope-Erweiterungen.
- Goal-driven execution: Akzeptanzkriterien definieren, dann gegen sie verifizieren.

## Projektkonventionen
- Projektsprache: Deutsch fuer Produktdokumentation und UI-Texte.
- Feature-ID-Prefix: `SMA`.
- Commit-Referenzen sollen Feature-IDs enthalten, z. B. `feat: SMA-004 Buchungslimit pruefen`.
- Rollen im Produkt: Inhaberin/Admin, Rezeption, Trainer, Mitglied.
- Premium-Regeln, Wartelistenfrist, Online-Zugang Basic und Geburtstagskommunikation sind offene Produktentscheidungen und duerfen nicht stillschweigend festgelegt werden.

## Bekannte Fallen
- `Kurs` beschreibt eine Kursart; `Kurstermin` ist die konkrete Durchfuehrung mit Datum, Uhrzeit, Raum und Trainer.
- Kapazitaet ergibt sich aus Kurslimit und Raumkapazitaet; die restriktivere Grenze sollte gelten, bis anders entschieden.
- No-Show-Zaehler meint aufeinanderfolgende unentschuldigte Fehlzeiten, nicht zwingend Gesamtanzahl.
- Zahlung ausstehend erzeugt Warnung, aber keine automatische Sperre.
- Trainer auf Honorarbasis duerfen nur tatsaechlich stattgefundene Termine in der Abrechnung sehen.

## Agenten-Erweiterung

Das Verzeichnis `_agent/` enthält einen vollständigen KI-Agenten für die
automatisierte Umsetzung dieses Projekts. Wenn Codex aufgefordert wird,
ein SMA-Feature umzusetzen, zuerst `_agent/SKILL.md` lesen. Die Skripte
in `_agent/scripts/` helfen bei Status-Verfolgung und Datenbank-Operationen.
