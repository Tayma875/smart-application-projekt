# Smart Application Projekt Agent

Dieser Agent automatisiert die Implementierung der Fitnessstudio-App.
Er wird von Codex verwendet, um SMA-Backlog-Items umzusetzen.

## Struktur

```
_agent/
├── SKILL.md                    # Anleitung für Codex
├── README.md                   # Diese Datei
├── scripts/
│   ├── status.sh               # Backlog-Fortschritt anzeigen
│   ├── set-status.sh           # SMA-Status setzen
│   ├── next-feature.sh         # Nächstes Feature ermitteln
│   ├── run-migration.sh        # Prisma-Migration + Seed
│   └── run-dev.sh              # Dev-Server starten
└── references/
    ├── feature-template.md     # Checkliste für Features
    └── decision-log.md         # Entscheidungen dokumentieren
```

## Nutzung

Codex liest automatisch `SKILL.md`, wenn der Skill durch eine
passende Aufgabe aktiviert wird. Die Skripte können manuell
aufgerufen werden:

```bash
./_agent/scripts/status.sh          # Fortschritt anzeigen
./_agent/scripts/next-feature.sh    # Nächstes Feature
./_agent/scripts/set-status.sh SMA-001 in-progress
```
