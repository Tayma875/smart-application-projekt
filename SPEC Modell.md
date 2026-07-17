**Entitäten**
- **Mitglied** (Mitglieds_ID, Tarif_ID, Vorname, Nachname, E-Mail-Adresse, Telefonnummer, Geburtsdatum, Mitgliedsstatus wie aktiv/pausiert/gekündigt/Zahlung ausstehend`, `Zahlungsstatus, Startdatum, optionales Foto, No-Show-Zähler)
- **Mitglieds_Historie** (Historie_ID, Mitglieds_ID, Tarif_ID, Startdatum, Enddatum, Bemerkung)
- **Tarif** (Tarif_ID, Tarifname wie Basic/Plus/Premium, Monatspreis, Laufzeittyp wie Jahresvertrag oder monatlich kündbar, monatliches Buchungslimit, Online-Berechtigung, spezifische Stornokonditionen)
- **Kurs** (Kurs_ID, Name wie Yoga, HIIT, Spinning, Functional Training, Beschreibung, Level wie Anfänger/Mittel/Fortgeschritten, max_Teilnehmer, Dauer, Datum, Kategorie, Voraussetzung_ID)
- **Kurstermin** (Termin_ID, Kurs_ID, Raum_ID, Trainer_ID, Datum, Uhrzeit, Status wie findet statt/abgesagt/Vertretung)
- **Trainer** (Trainer_ID, Name, Spezialisierung, Beschäftigungsart wie fest angestellt oder Honorarbasis)
- **Buchung** (Buchung_ID, Mitglieds_ID, Termin_ID, Buchungszeitpunkt, Teilnahmestatus wie angemeldet/teilgenommen/No-Show/storniert, Stornozeitpunkt)
- **Warteliste** (Warteliste_ID, Mitglieds_ID, Termin_ID, Reihenfolge, Eintragungszeitpunkt)
- **Online-Content** (Online-Content_ID, Titel, Beschreibung, Kategorie wie Live-Streams, On Demand Videos, Video-URL, Kurs_ID, Dauer, Tarif-Voraussetzung)
- **Raum** (Raum_ID, Raumname, Kapazität, Raumtyp)




**Beziehungen**
1:n Beziehungen 
- **Tarif - Mitglied:** Einem Tarif sind viele Mitglieder zugeordnet. Zu jedem aktuellen Zeitpunkt hat ein Mitglied genau einen festen Tarif.
- **Kurs - Kurstermin:** Eine Kursart (wie „Yoga“ oder „HIIT“) bildet die Basis für viele einzelne Termine im Wochenplan.
- **Trainer - Kurstermin:** Ein Trainer leitet viele verschiedene Termine. Für jeden konkreten Kurstermin ist jedoch genau ein verantwortlicher Trainer eingetragen.
- **Raum - Kurstermin:** Ein Raum (z. B. der Spinning-Raum oder der große Kursraum) beherbergt nacheinander viele verschiedene Kurstermine. Ein Termin findet dabei immer in genau einem dieser Räume statt.
- **Kurstermin - Buchung:** Ein einzelner Kurstermin kann viele Buchungen von verschiedenen Mitgliedern haben, bis die maximale Kapazität erreicht ist.
- **Mitglied - Buchung:** Ein Mitglied kann im Laufe der Zeit viele verschiedene Buchungen für unterschiedliche Kurse vornehmen.
- **Kurstermin - Warteliste:** Ein ausgebuchter Kurstermin kann eine Warteliste mit bis zu fünf Einträgen führen.

n:m Beziehungen 
- **Mitglied - Kurstermin:** Viele Mitglieder buchen viele verschiedene Termine, und jeder Termin hat wiederum viele Teilnehmer.
- **Trainer - Kurs:** Ein Trainer kann für mehrere Kursarten qualifiziert sein (z. B. Marie für Yoga und Pilates), und eine Kursart kann von verschiedenen Trainern unterrichtet werden.

1:1 Beziehungen 
- **Mitglied - Account:** Jedes physische Mitglied erhält genau einen digitalen Login-Account für die App, um seine eigenen Daten und Buchungen zu verwalten.

**Geschäftsregeln**
- Buchungen und kostenfreie Stornierungen müssen bis spätestens zwei Stunden vor Kursbeginn erfolgen.
- Bei einer Absage weniger als zwei Stunden vor Beginn wird eine Gebühr fällig (50 % des Kurspreises), außer bei Premium-Mitgliedern.
- Die Warteliste ist auf maximal 5 Personen pro Kurs begrenzt.
- Das System informiert die Inhaberin, wenn ein Mitglied **zweimal hintereinander** unentschuldigt fehlt. Dies dient als Frühwarnsystem, bevor die automatische Sperre nach dem dritten Mal greift. Wer dreimal hintereinander unentschuldigt fehlt, wird für zwei Wochen für Live-Buchungen gesperrt. Aber das Admin soll  auch die Möglichkeit haben die Sperre manuell aufzuheben falls es einen guten Grund gibt — wenn jemand zum Beispiel nachweislich krank war oder ein Notfall da war.
- Mitgliedschaften können für maximal drei Monate pro Jahr pausiert werden.
- Mitglieder mit dem Status „Zahlung ausstehend“ erhalten eine Warnung im System, werden aber nicht automatisch gesperrt; die Entscheidung liegt bei der Inhaberin.
- Trainer Sehen nur ihren eigenen Kursplan und Teilnehmerlisten; sie können Anwesenheiten abhaken, aber keine Buchungen ändern
- **Inhaberin (Admin):** Voller Zugriff auf alle Daten, Tarife und Finanzen.
- **Rezeption (Teilzeit):** Kann Mitglieder anlegen und Buchungen verwalten, aber keine Tarife ändern oder Kurse löschen.
- **Buchungslimits:** Der Basic-Tarif ist auf eine bestimmte Anzahl von Buchungen (z. B. 5 pro Monat) begrenzt. Premium hat keine Limits.
-  **Warnsystem bei Ausfall:** Wenn ein Trainer kurzfristig ausfällt, generiert das System zunächst eine interne Warnmeldung (z. B. ein roter Hinweis), die nur für die Inhaberin sichtbar ist. Die  Inhaberin hat die Möglichkeit, vor einer Absage manuell einen Ersatztrainer für den betroffenen Kurstermin einzutragen, um den Kurs stattfinden zu lassen. Erst wenn die Inhaberin den Kurs explizit als „abgesagt“ markiert, wird der automatisierte Kommunikations- und Stornierungsprozess gestartet
- Sobald ein Kurs als abgesagt markiert wird, kriegen alle gebuchten Mitglieder sowie alle Personen auf der Warteliste sofort eine automatische Benachrichtigung, Buchungen werden automatisch storniert ohne Gebühr + Kontigentfreigabe
- Basic bekommen nur Studio. Plus Mitglieder kriegen dann schon Zugang zu den Online-Videos und Live-Streams von zuhause. Und Premium Mitglieder erhalten alles unbegrenzt
- Das System muss für Trainer auf Honorarbasis (z. B. Tom, Jonas) automatisch eine Übersicht aller **durchgeführten Kurstermine** (Status: „stattgefunden“) für einen frei wählbaren Zeitraum (z. B. Monatsende) generieren. Nur Kurstermine, die tatsächlich stattgefunden haben und nicht als „abgesagt“ markiert wurden, dürfen in die Abrechnungsübersicht für Honorartrainer einfließen. Die Übersicht muss zwingend das **Datum**, den **Kursnamen** und die **Dauer** des Termins enthalten, um die bisherige handschriftliche Liste zu ersetzen.
- Kurse der Level „Anfänger“ und „Mittel“ bleiben für alle aktiven Mitglieder ohne Einschränkung frei buchbar. Ein Mitglied kann einen Kurs des Levels „Fortgeschritten“ (Advanced) erst buchen, nachdem die Inhaberin (Admin) eine **manuelle Freigabe pro Mitglied und Kurs-Kategorie** (z. B. Yoga, Spinning) erteilt hat. Das System bietet der Inhaberin bei der Freigabeprüfung einen **automatisierten Hinweis**, ob das Mitglied bereits Mittel-Kurse in der jeweiligen Kategorie besucht hat, ersetzt aber nicht die finale manuelle Entscheidung.
- Das System versendet automatisch Kurserinnerungen (per Push oder E-Mail) in zwei Stufen: **24 Stunden** sowie **eine Stunde** vor Kursbeginn.
- Sobald ein Kurs eine Auslastung von **80 %** erreicht, erhält die Inhaberin eine Benachrichtigung, um proaktiv über Zusatztermine entscheiden zu können.
- Das System informiert die Inhaberin, wenn ein Mitglied **zweimal hintereinander** 
- **Vertrags-Monitoring:** Die Inhaberin erhält automatische Erinnerungen über **auslaufende oder bereits abgelaufene Mitgliedschaften**.


**Widersprüche (gelöst am 2026-07-17)**
- **Sperre für Premium-Mitglieder:** Lisa möchte eine automatische Sperre bei dreimaligem Fehlen (No-Show). An anderer Stelle sagt sie jedoch explizit, dass es für Premium-Mitglieder keine automatische Sperre geben soll, sondern sie nur informiert werden möchte, um persönlich zu entscheiden.
- **Geburtstag:** Das System sendet am Geburtstag eines Mitglieds automatisch eine personalisierte Nachricht aber Lisa erwähnt, dass das System sie erinnern soll, wenn jemand Geburtstag hat, aber selber der Person schreibt
**Auflösung (2026-07-17)**
- **No-Show-Sperre:** Die automatische Sperre nach drei No-Shows gilt nur für Basic- und Plus-Mitglieder. Premium-Mitglieder werden nicht automatisch gesperrt; Lisa erhält eine Benachrichtigung und entscheidet individuell.
- **Geburtstag:** Keine automatische Nachricht. Lisa wird erinnert und schreibt persönlich, um den persönlichen Kontakt zu stärken.

**Auflösung (2026-07-17)**
- **Wartelisten-Bestätigungsfrist:** Nachgerückte Mitglieder haben 60 Minuten Zeit, die Buchung zu bestätigen, sonst verfällt der Anspruch.
- **Online-Zugang für Basic:** Basic erhält eingeschränkten Online-Zugang (On-Demand-Videos, keine Live-Streams).
**No-Show-Sperre für Premium-Mitglieder**
Die automatische Sperre nach drei No-Shows gilt nur für Basic- und Plus-Mitglieder. Premium-Mitglieder besitzen aufgrund ihres Tarifs erweiterte Stornierungsrechte und sollen daher nicht automatisch gesperrt werden. Stattdessen erhält Lisa eine Benachrichtigung und entscheidet individuell, ob eine Sperre verhängt wird.
**Geburtstagsnachrichten**
Das System verschickt keine automatische Geburtstagsnachricht an Mitglieder. Stattdessen erinnert es Lisa daran, dass ein Mitglied Geburtstag hat. Die Glückwünsche oder ein individuelles Angebot werden anschließend persönlich von Lisa versendet, um den persönlichen Kontakt zu stärken und sich von großen Fitnessketten abzuheben.
