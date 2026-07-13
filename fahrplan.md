# Fahrplan - Smart Application Projekt

_Basis: `SPEC Modell.md`, abgeglichen mit `docs/spec.md`, `docs/backlog.md`, `docs/architecture.md` und `docs/decisions.md`._

## Ziel

Am Ende soll eine lokal lauffaehige Fitnessstudio-App entstehen, mit der Mitglieder, Tarife, Kurse, Buchungen, Wartelisten, Trainerplaene, Online-Content und operative Warnungen verwaltet werden koennen.

Die fachliche Grundlage bleibt `docs/spec.md`. Dieser Fahrplan ist nur eine Arbeitsliste fuer die restlichen To-dos.

## Aktueller Stand

- Projekt-Dokumentation ist angelegt: `AGENTS.md`, `CLAUDE.md`, `docs/spec.md`, `docs/backlog.md`, `docs/architecture.md`, `docs/decisions.md`.
- Backlog-IDs `SMA-001` bis `SMA-031` sind vorhanden.
- Es gibt noch keinen App-Code.
- Es gibt aktuell kein initialisiertes Git-Repo in diesem Ordner.
- Der Tech-Stack ist noch nicht entschieden.
- Alle Features stehen noch auf `hypo`.

## Phase 0 - Projekt arbeitsfaehig machen

### To-dos

- Git im Projektordner initialisieren.
- Ersten Commit mit der vorhandenen Dokumentation erstellen.
- GitHub-Repo anlegen und Projekt pushen.
- README anlegen mit:
  - Projektname
  - Setup-Anleitung
  - verwendetes KI-Tool und Modell
  - lokale Startbefehle
- Tech-Stack entscheiden und in `docs/decisions.md` dokumentieren.
- Empfehlung fuer den Kurs: Next.js, TypeScript, Prisma, SQLite.
- App-Grundgeruest erstellen.
- SQLite/Prisma einrichten.
- Erste Test- oder Validierungsstrategie festlegen.

### Ergebnis

Ein GitHub-Repo existiert, die App startet lokal, und die Datenbank-Grundlage ist vorbereitet.

## Phase 1 - Kernmodell und Stammdaten

Ziel: Die wichtigsten Entitaeten aus der Spec als Datenmodell und einfache Verwaltungsoberflaechen abbilden.

### SMA-001 - Rollen- und Rechteverwaltung

- Rollen definieren: Inhaberin/Admin, Rezeption, Trainer, Mitglied.
- Rechte technisch abbilden.
- Mindestens einfache Zugriffspruefungen vorbereiten.
- Sicherstellen, dass Rezeption keine Tarife aendern und keine Kurse loeschen darf.
- Sicherstellen, dass Trainer nur eigene Termine und Teilnehmerlisten sehen.

### SMA-002 - Mitgliederverwaltung

- Mitglieder anlegen, anzeigen, bearbeiten.
- Felder umsetzen: Name, E-Mail, Telefon, Geburtsdatum, Status, Zahlungsstatus, Startdatum, Foto optional, No-Show-Zaehler.
- Statuswerte vorbereiten: aktiv, pausiert, gekuendigt, Zahlung ausstehend.

### SMA-003 - Tarifverwaltung

- Tarife Basic, Plus, Premium verwalten.
- Felder umsetzen: Name, Monatspreis, Laufzeittyp, monatliches Buchungslimit, Online-Berechtigung, Stornoregeln.
- Basic-Limit noch als konfigurierbaren Wert abbilden, falls die genaue Zahl offen bleibt.

### SMA-004 - Mitglieds- und Tarifhistorie

- Tarifwechsel und Statuswechsel historisieren.
- Startdatum, Enddatum und Bemerkung speichern.
- Sicherstellen: Ein Mitglied hat zu einem Zeitpunkt genau einen aktiven Tarif.

### SMA-005 - Kursarten verwalten

- Kursarten wie Yoga, HIIT, Spinning und Functional Training anlegen.
- Felder umsetzen: Name, Beschreibung, Level, Kategorie, Dauer, maximale Teilnehmerzahl, Voraussetzung.
- Wichtig: `Kurs` ist nur die Kursart, nicht der konkrete Termin.

### SMA-006 - Kurstermine planen

- Konkrete Termine fuer Kursarten anlegen.
- Felder umsetzen: Kurs, Raum, Trainer, Datum, Uhrzeit, Status.
- Statuswerte vorbereiten: findet statt, abgesagt, Vertretung, stattgefunden.

### SMA-007 - Raeume und Kapazitaeten verwalten

- Raeume mit Name, Kapazitaet und Raumtyp anlegen.
- Kapazitaet eines Termins aus Kurslimit und Raumkapazitaet berechnen.
- Bis anders entschieden gilt die kleinere Grenze.

### SMA-008 - Trainerprofile und Qualifikationen

- Trainer mit Name, Spezialisierung und Beschaeftigungsart verwalten.
- Beschaeftigungsarten: fest angestellt, Honorarbasis.
- n:m-Beziehung Trainer/Kursart fuer Qualifikationen umsetzen.

### SMA-009 - Mitglieder-Account

- 1:1-Account fuer Mitglieder vorbereiten.
- Login-Rolle dem Account zuordnen.
- Fuer Phase 1 reicht ggf. ein einfacher lokaler Auth-Ansatz oder Seed-Accounts, wenn echte Auth noch zu gross ist.

### Ergebnis

Das Datenmodell steht, Stammdaten koennen angelegt werden, und die App bildet die Hauptentitaeten der Spec ab.

## Phase 2 - Buchungen, Regeln und Anwesenheit

Ziel: Die Kernlogik rund um Kursbuchung, Storno, Warteliste und No-Shows funktionsfaehig machen.

### SMA-010 - Kursbuchung

- Mitglieder koennen Kurstermine buchen.
- Buchungen nur bis spaetestens zwei Stunden vor Kursbeginn erlauben.
- Kapazitaetsgrenze beachten.
- Teilnahmebeziehung Mitglied/Kurstermin ueber Buchung speichern.

### SMA-011 - Storno mit Gebuehrenlogik

- Storno bis zwei Stunden vor Kursbeginn kostenfrei.
- Spaetstorno mit 50 Prozent Gebuehr markieren.
- Premium-Ausnahme erst final umsetzen, wenn die offene Entscheidung geklaert ist.

### SMA-012 - Monatliche Buchungslimits

- Basic-Buchungslimit pro Monat pruefen.
- Premium ohne Limit behandeln.
- Plus-Regel entsprechend Tarifdaten umsetzen.

### SMA-013 - Warteliste

- Wenn Termin ausgebucht ist, Wartelistenplatz anbieten.
- Warteliste auf maximal 5 Personen pro Termin begrenzen.
- Reihenfolge und Eintragungszeitpunkt speichern.

### SMA-014 - Wartelisten-Nachruecken

- Nachruecken vorbereiten, wenn ein Platz frei wird.
- Bestaetigungsfrist erst final umsetzen, wenn 30 vs. 60 Minuten geklaert ist.

### SMA-015 - Anwesenheit fuer Trainer

- Trainer koennen Teilnehmerlisten ihrer eigenen Termine sehen.
- Trainer koennen teilgenommen, No-Show oder storniert markieren.
- Trainer duerfen keine Buchungen aendern.

### SMA-016 - No-Show-Warnung nach zwei Fehlzeiten

- Aufeinanderfolgende unentschuldigte Fehlzeiten zaehlen.
- Nach zwei No-Shows interne Warnung fuer Inhaberin/Admin erzeugen.

### SMA-017 - No-Show-Sperre nach drei Fehlzeiten

- Nach drei aufeinanderfolgenden No-Shows Live-Buchungssperre fuer zwei Wochen setzen.
- Premium-Ausnahme erst final umsetzen, wenn die offene Entscheidung geklaert ist.

### SMA-018 - Manuelle Entsperrung

- Admin kann Sperre manuell aufheben.
- Grund dokumentieren, z. B. Krankheit oder Notfall.

### SMA-019 - Mitgliedschaft pausieren

- Mitgliedschaften pausieren.
- Maximal drei Monate Pause pro Jahr pruefen.
- Zeitraum und Bemerkung speichern.

### SMA-020 - Zahlung-ausstehend-Warnung

- Mitglieder mit Status `Zahlung ausstehend` intern markieren.
- Warnung anzeigen.
- Keine automatische Sperre ausloesen.

### Ergebnis

Die wichtigsten operativen Studioablaeufe funktionieren: Buchen, Stornieren, Warteliste, Anwesenheit, No-Show-Regeln und Zahlungshinweise.

## Phase 3 - Warnungen, Kommunikation und Monitoring

Ziel: Automatisierungen und operative Hinweise fuer die Inhaberin abbilden.

### SMA-021 - Trainerausfall-Warnung

- Kurzfristigen Trainerausfall als interne Warnung anzeigen.
- Keine automatische Kursabsage ausloesen.
- Admin kann Ersatztrainer eintragen.

### SMA-022 - Kursabsage-Workflow

- Admin markiert Kurstermin explizit als abgesagt.
- Gebuchte Mitglieder und Wartelistenpersonen werden benachrichtigt.
- Buchungen werden ohne Gebuehr storniert.
- Kontingente werden freigegeben.

### SMA-023 - Kurserinnerungen

- Erinnerungen 24 Stunden und eine Stunde vor Kursbeginn vorbereiten.
- Fuer lokale App reicht ggf. eine Benachrichtigungs-Tabelle oder ein simulierter Versand.

### SMA-024 - Auslastungswarnung bei 80 Prozent

- Auslastung pro Kurstermin berechnen.
- Ab 80 Prozent interne Admin-Warnung erzeugen.
- Admin kann Zusatztermine pruefen.

### SMA-025 - Vertrags-Monitoring

- Auslaufende und abgelaufene Mitgliedschaften erkennen.
- Admin-Erinnerung erzeugen.

### SMA-026 - Geburtstagsprozess

- Geburtstagserkennung vorbereiten.
- Entscheidung offen lassen: automatische Mitgliedsnachricht oder Erinnerung an Inhaberin.
- Erst nach Klaerung final bauen.

### Ergebnis

Die App unterstuetzt die Inhaberin aktiv mit Warnungen, Erinnerungen und geregelten Absageablaeufen.

## Phase 4 - Online-Content, Advanced-Freigabe und Abrechnung

Ziel: Erweiterte Fachlogik aus der Spec umsetzen.

### SMA-027 - Online-Content-Verwaltung

- Online-Content anlegen: Live-Streams, On-Demand-Videos.
- Felder umsetzen: Titel, Beschreibung, Kategorie, Video-URL, Kursbezug, Dauer, Tarif-Voraussetzung.

### SMA-028 - Tarifbasierter Online-Zugang

- Plus bekommt Online-Videos und Live-Streams.
- Premium bekommt alles unbegrenzt.
- Basic-Regel erst final umsetzen, wenn offene Entscheidung geklaert ist.

### SMA-029 - Advanced-Freigabe

- Fortgeschrittenenkurse nur mit manueller Admin-Freigabe pro Mitglied und Kurs-Kategorie buchbar machen.
- Anfaenger- und Mittelkurse fuer aktive Mitglieder frei buchbar lassen.

### SMA-030 - Advanced-Hinweis aus Teilnahmehistorie

- Bei Freigabepruefung anzeigen, ob Mitglied bereits Mittel-Kurse in der Kategorie besucht hat.
- Hinweis darf die manuelle Admin-Entscheidung nicht ersetzen.

### SMA-031 - Honorartrainer-Abrechnung

- Fuer Honorartrainer frei waehlbare Zeitraeume auswerten.
- Nur Kurstermine mit Status `stattgefunden` einbeziehen.
- Uebersicht muss Datum, Kursname und Dauer enthalten.

### Ergebnis

Die App deckt die erweiterten Anforderungen aus der Spec ab: Online-Angebot, Advanced-Freigaben und Abrechnung fuer Honorartrainer.

## Offene Entscheidungen vor Umsetzung

Diese Punkte nicht stillschweigend entscheiden:

- `SMA-014`: Wartelisten-Bestaetigungsfrist: 30 oder 60 Minuten?
- `SMA-011`, `SMA-017`: Premium-Mitglieder nur von Spaetstorno-Gebuehren befreit oder auch von automatischer No-Show-Sperre?
- `SMA-028`: Basic ohne Online-Zugang oder eingeschraenkter Zugriff?
- `SMA-026`: Geburtstagskommunikation automatisch an Mitglied oder nur Erinnerung an Inhaberin?
- Alle Features: finaler Tech-Stack, Auth-Ansatz, Benachrichtigungskanal.

## Arbeitsregel pro Feature

Fuer jedes Feature:

1. Relevante Abschnitte in `docs/spec.md`, `docs/backlog.md`, `docs/architecture.md` und `docs/decisions.md` lesen.
2. Feature-ID im Backlog auf `in-progress` setzen.
3. Erfolgskriterien konkret notieren.
4. Nur dieses Feature bauen.
5. Lokal testen.
6. `docs/decisions.md` aktualisieren, falls eine Entscheidung getroffen wurde.
7. `docs/backlog.md` auf `done` setzen und Commit-Hinweis eintragen.
8. Commit mit Feature-ID erstellen.
9. Push zu GitHub.

## Empfohlene naechste konkrete Schritte

1. Git initialisieren und erstes Repo-Setup committen.
2. Tech-Stack entscheiden: empfohlen Next.js + TypeScript + Prisma + SQLite.
3. Entscheidung in `docs/decisions.md` dokumentieren.
4. App-Grundgeruest erstellen.
5. Prisma-Schema aus den Kernentitaeten ableiten.
6. Mit `SMA-001` bis `SMA-003` beginnen: Rollen, Mitglieder, Tarife.
7. Danach erst Buchungen und Regeln bauen.
