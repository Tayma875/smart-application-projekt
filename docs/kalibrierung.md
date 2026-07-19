# Kalibrierung – Smart Application Projekt

## Business Rules

### 1. Fortgeschrittenen Kurse brauchen Freigabe vom Admin
—> geprüft an Max da er erstmals kein funktional training ausführen konnte. Ich musste in die admin rolle rein, max freigeben, sodass er erst danach das training buchen konnte
—> Konfidenz 10

### 2. Mitglieder mit dem Status „Zahlung ausstehend“ erhalten eine Warnung im System, werden aber nicht automatisch gesperrt; die Entscheidung liegt bei der Inhaberin.
—> das sieht man direkt in der Ansicht vom Admin und kann man dann in der tabelle überprüfen, wer noch nicht bezahlt hat
—> Konfidenz 9

## Datenmodell (n:m)

### 3. Mitglied - Kurstermin: Viele Mitglieder buchen viele verschiedene Termine, und jeder Termin hat wiederum viele Teilnehmer.
—> Max hat viele Kursbuchungen getätigt und man sieht auch wie viele Plätze vergeben sind
—> Konfidenz: 9

## Widerspruchsauflösung

### 4. Geburtstagsnachrichten
Das System verschickt keine automatische Geburtstagsnachricht an Mitglieder. Stattdessen erinnert es Lisa daran, dass ein Mitglied Geburtstag hat. Die Glückwünsche oder ein individuelles Angebot werden anschließend persönlich von Lisa versendet, um den persönlichen Kontakt zu stärken und sich von großen Fitnessketten abzuheben.
—> das sieht man direkt auf der Startseite
—> Konfidenz: 9

## 1 frei

### 5. Trainer Sehen nur ihren eigenen Kursplan und Teilnehmerlisten; sie können Anwesenheiten abhaken, aber keine Buchungen ändern
—> Unter trainer@smart-fitness.de / trainer123 hab ich die Teilnehmerliste abhaken können und sogar „no Shows“ markieren
—> Konfidenz: 10
