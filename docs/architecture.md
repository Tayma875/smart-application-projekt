# Architecture - Smart Application Projekt

_Stand: 2026-06-26_

## Zweck
Dieses Dokument haelt die technische Wahrheit fest: Domaenenmodell, Rollen, Systemgrenzen und spaetere Architekturentscheidungen. Der konkrete Tech-Stack ist noch offen und wird in `docs/decisions.md` entschieden.

## Domaenenmodell

### Kernentitaeten
- `Mitglied`: Person mit Kontaktdaten, Status, aktuellem Tarif, Zahlungsstatus, Startdatum, optionalem Foto und No-Show-Zaehler.
- `Account`: Login zum Mitglied oder zu internen Rollen.
- `Tarif`: Basic, Plus, Premium mit Preis, Laufzeit, Buchungslimit, Online-Berechtigung und Stornoregeln.
- `MitgliedsHistorie`: Tarif- und Statushistorie eines Mitglieds.
- `Kurs`: Wiederverwendbare Kursart mit Name, Beschreibung, Level, Kategorie, Dauer und Voraussetzungen.
- `Kurstermin`: Konkreter Termin mit Kurs, Raum, Trainer, Datum, Uhrzeit und Status.
- `Trainer`: Trainerprofil mit Spezialisierung und Beschaeftigungsart.
- `Raum`: Raum mit Kapazitaet und Typ.
- `Buchung`: Teilnahmebeziehung zwischen Mitglied und Kurstermin.
- `WartelistenEintrag`: Wartelistenposition fuer ausgebuchte Termine.
- `OnlineContent`: Video oder Stream mit Kategorie, URL, Dauer, Kursbezug und Tarifvoraussetzung.
- `AdvancedFreigabe`: Manuelle Admin-Freigabe pro Mitglied und Kurs-Kategorie fuer Fortgeschrittenen-Kurse.
- `Benachrichtigung`: Systemereignis fuer Push/E-Mail/interne Hinweise.

## Rollen und Rechte

| Rolle | Rechte |
|-------|--------|
| Inhaberin/Admin | Vollzugriff auf Mitglieder, Tarife, Kurse, Termine, Finanzen, Freigaben, Sperren und Warnungen |
| Rezeption | Mitglieder anlegen, Buchungen verwalten; keine Tarifaenderung, kein Kursloeschen |
| Trainer | Eigener Kursplan, eigene Teilnehmerlisten, Anwesenheit abhaken; keine Buchungsaenderungen |
| Mitglied | Eigene Daten einsehen, Kurse buchen/stornieren, erlaubten Online-Content nutzen |

## Wichtige Invarianten
- Ein Mitglied hat zu einem Zeitpunkt genau einen aktiven Tarif.
- Ein Kurstermin hat genau einen Raum und einen verantwortlichen Trainer.
- Kapazitaet eines Termins darf die kleinere Grenze aus Raumkapazitaet und Kurslimit nicht ueberschreiten.
- Warteliste ist auf 5 Eintraege pro Termin begrenzt.
- Kostenfreie Stornos sind nur bis 2 Stunden vor Kursbeginn moeglich.
- Zahlung ausstehend blockiert nicht automatisch.
- Admin kann No-Show-Sperren manuell aufheben.
- Honorarabrechnung darf nur Termine mit Status `stattgefunden` enthalten.

## Ereignisse und Automatisierungen
- `booking.created`: Buchung angelegt, Kontingent reduziert.
- `booking.cancelled`: Buchung storniert, Kontingent freigegeben.
- `class.capacity_80_reached`: interne Admin-Warnung.
- `class.trainer_unavailable`: interne Admin-Warnung, keine automatische Absage.
- `class.cancelled_by_admin`: Benachrichtigung an Buchungen und Warteliste, gebuehrenfreie Stornierung.
- `attendance.no_show_recorded`: No-Show-Zaehler aktualisieren, ggf. Warnung/Sperre.
- `class.reminder_due_24h` und `class.reminder_due_1h`: Kurserinnerungen.
- `membership.contract_expiring`: Admin-Erinnerung.
- `birthday.due`: offen, ob Admin-Erinnerung oder automatische Mitgliedsnachricht.

## Noch offene technische Entscheidungen
- Framework und Programmiersprache.
- Datenbank und Migrationsstrategie.
- Authentifizierung und Rollenmodell.
- Benachrichtigungskanaele.
- Deployment/Hosting.
- Audit-Log fuer kritische Admin-Aktionen.

## Testfokus
- Rollenrechte und verbotene Aktionen.
- Buchungs- und Stornozeitfenster.
- Tarifbasierte Buchungslimits und Online-Berechtigungen.
- Warteliste inklusive Maximalgroesse und Nachrueckprozess.
- No-Show-Zaehler, Warnung, Sperre und manuelle Entsperrung.
- Kursabsage-Workflow.
- Honorartrainer-Abrechnung.
