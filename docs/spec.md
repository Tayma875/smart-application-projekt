# Spec - Smart Application Projekt

_Quelle: inhaltlich uebernommen und normalisiert aus `SPEC Modell.md` am 2026-06-26. Widersprüche aufgelöst am 2026-07-17._

## Entitaeten
- **Mitglied** (Mitglieds_ID, Tarif_ID, Vorname, Nachname, E-Mail-Adresse, Telefonnummer, Geburtsdatum, Mitgliedsstatus wie aktiv/pausiert/gekuendigt/Zahlung ausstehend, Zahlungsstatus, Startdatum, optionales Foto, No-Show-Zaehler)
- **Mitglieds_Historie** (Historie_ID, Mitglieds_ID, Tarif_ID, Startdatum, Enddatum, Bemerkung)
- **Tarif** (Tarif_ID, Tarifname wie Basic/Plus/Premium, Monatspreis, Laufzeittyp wie Jahresvertrag oder monatlich kuendbar, monatliches Buchungslimit, Online-Berechtigung, spezifische Stornokonditionen)
- **Kurs** (Kurs_ID, Name wie Yoga, HIIT, Spinning, Functional Training, Beschreibung, Level wie Anfaenger/Mittel/Fortgeschritten, max_Teilnehmer, Dauer, Datum, Kategorie, Voraussetzung_ID)
- **Kurstermin** (Termin_ID, Kurs_ID, Raum_ID, Trainer_ID, Datum, Uhrzeit, Status wie findet statt/abgesagt/Vertretung)
- **Trainer** (Trainer_ID, Name, Spezialisierung, Beschaeftigungsart wie fest angestellt oder Honorarbasis)
- **Buchung** (Buchung_ID, Mitglieds_ID, Termin_ID, Buchungszeitpunkt, Teilnahmestatus wie angemeldet/teilgenommen/No-Show/storniert, Stornozeitpunkt)
- **Warteliste** (Warteliste_ID, Mitglieds_ID, Termin_ID, Reihenfolge, Eintragungszeitpunkt)
- **Online-Content** (Online-Content_ID, Titel, Beschreibung, Kategorie wie Live-Streams, On Demand Videos, Video-URL, Kurs_ID, Dauer, Tarif-Voraussetzung)
- **Raum** (Raum_ID, Raumname, Kapazitaet, Raumtyp)

## Beziehungen

### 1:n Beziehungen
- **Tarif - Mitglied:** Einem Tarif sind viele Mitglieder zugeordnet. Zu jedem aktuellen Zeitpunkt hat ein Mitglied genau einen festen Tarif.
- **Kurs - Kurstermin:** Eine Kursart bildet die Basis fuer viele einzelne Termine im Wochenplan.
- **Trainer - Kurstermin:** Ein Trainer leitet viele verschiedene Termine. Fuer jeden konkreten Kurstermin ist genau ein verantwortlicher Trainer eingetragen.
- **Raum - Kurstermin:** Ein Raum beherbergt nacheinander viele verschiedene Kurstermine. Ein Termin findet immer in genau einem Raum statt.
- **Kurstermin - Buchung:** Ein einzelner Kurstermin kann viele Buchungen haben, bis die maximale Kapazitaet erreicht ist.
- **Mitglied - Buchung:** Ein Mitglied kann viele Buchungen fuer unterschiedliche Kurse vornehmen.
- **Kurstermin - Warteliste:** Ein ausgebuchter Kurstermin kann eine Warteliste mit bis zu fuenf Eintraegen fuehren.

### n:m Beziehungen
- **Mitglied - Kurstermin:** Viele Mitglieder buchen viele verschiedene Termine, und jeder Termin hat viele Teilnehmer.
- **Trainer - Kurs:** Ein Trainer kann fuer mehrere Kursarten qualifiziert sein, und eine Kursart kann von verschiedenen Trainern unterrichtet werden.

### 1:1 Beziehungen
- **Mitglied - Account:** Jedes physische Mitglied erhaelt genau einen digitalen Login-Account fuer die App, um eigene Daten und Buchungen zu verwalten.

## Geschaeftsregeln
- Buchungen und kostenfreie Stornierungen muessen bis spaetestens zwei Stunden vor Kursbeginn erfolgen.
- Bei einer Absage weniger als zwei Stunden vor Beginn wird eine Gebuehr faellig (50 % des Kurspreises), ausser bei Premium-Mitgliedern.
- Die Warteliste ist auf maximal 5 Personen pro Kurs begrenzt. Nachgerückte Mitglieder haben 60 Minuten Zeit, die Buchung zu bestätigen, sonst verfällt der Anspruch.
- Das System informiert die Inhaberin, wenn ein Mitglied zweimal hintereinander unentschuldigt fehlt.
- Wer dreimal hintereinander unentschuldigt fehlt, wird fuer zwei Wochen fuer Live-Buchungen gesperrt.
- **Premium-Ausnahme bei No-Show:** Die automatische Sperre nach drei No-Shows gilt nur fuer Basic- und Plus-Mitglieder. Premium-Mitglieder werden nicht automatisch gesperrt; die Inhaberin erhaelt eine Benachrichtigung und entscheidet individuell.
- Admins koennen No-Show-Sperren manuell aufheben, z. B. bei Krankheit oder Notfall.
- Mitgliedschaften koennen fuer maximal drei Monate pro Jahr pausiert werden.
- Mitglieder mit Status `Zahlung ausstehend` erhalten eine Warnung im System, werden aber nicht automatisch gesperrt.
- Trainer sehen nur ihren eigenen Kursplan und Teilnehmerlisten; sie koennen Anwesenheiten abhaken, aber keine Buchungen aendern.
- **Inhaberin/Admin:** Voller Zugriff auf alle Daten, Tarife und Finanzen.
- **Rezeption:** Kann Mitglieder anlegen und Buchungen verwalten, aber keine Tarife aendern oder Kurse loeschen.
- **Buchungslimits:** Basic ist auf eine bestimmte Anzahl von Buchungen pro Monat begrenzt; Premium hat keine Limits.
- **Warnsystem bei Trainerausfall:** Bei kurzfristigem Ausfall wird zuerst eine interne Warnung fuer die Inhaberin erzeugt. Die Inhaberin kann vor Absage manuell einen Ersatztrainer eintragen.
- Erst wenn die Inhaberin einen Kurs explizit als abgesagt markiert, startet der automatisierte Kommunikations- und Stornierungsprozess.
- Bei Kursabsage erhalten gebuchte Mitglieder und Wartelistenpersonen sofort eine automatische Benachrichtigung. Buchungen werden ohne Gebuehr storniert und Kontingente werden freigegeben.
- Basic erhaelt eingeschraenkten Online-Zugang (nur On-Demand-Videos, keine Live-Streams). Plus erhaelt Online-Videos und Live-Streams. Premium erhaelt alles unbegrenzt.
- Fuer Honorartrainer generiert das System fuer frei waehlbare Zeitraeume eine Uebersicht aller durchgefuehrten Kurstermine mit Datum, Kursname und Dauer.
- Nur Termine mit Status `stattgefunden` duerfen in die Honorarabrechnung einfliessen.
- Anfaenger- und Mittelkurse bleiben fuer alle aktiven Mitglieder frei buchbar.
- Fortgeschrittenenkurse koennen erst nach manueller Admin-Freigabe pro Mitglied und Kurs-Kategorie gebucht werden.
- Das System zeigt der Inhaberin bei der Freigabepruefung einen Hinweis, ob das Mitglied bereits Mittel-Kurse in der Kategorie besucht hat.
- Das System versendet Kurserinnerungen 24 Stunden und eine Stunde vor Kursbeginn.
- Bei 80 % Auslastung erhaelt die Inhaberin eine Benachrichtigung, um Zusatztermine pruefen zu koennen.
- **Vertrags-Monitoring:** Die Inhaberin erhaelt automatische Erinnerungen ueber auslaufende oder bereits abgelaufene Mitgliedschaften.
- **Geburtstagskommunikation:** Das System sendet keine automatische Geburtstagsnachricht. Stattdessen erhaelt die Inhaberin eine Erinnerung, um persoenlich zu gratulieren oder ein individuelles Angebot zu versenden.

## Fruehere Widersprueche (alle aufgelöst)
- **Sperre fuer Premium-Mitglieder:** Geloest am 2026-07-17 – Premium ist von der automatischen No-Show-Sperre ausgenommen; Admin erhaelt nur eine Benachrichtigung.
- **Geburtstag:** Geloest am 2026-07-17 – Keine automatische Nachricht, nur Admin-Erinnerung fuer persoenliche Kontaktaufnahme.
- **Bestaetigungsfrist der Warteliste:** Geloest am 2026-07-17 – 60 Minuten Bestaetigungsfrist fuer nachgerueckte Mitglieder.
- **Online-Zugang fuer Basic:** Geloest am 2026-07-17 – Basic erhaelt eingeschraenkten Online-Zugang (On-Demand-Videos, keine Live-Streams).
