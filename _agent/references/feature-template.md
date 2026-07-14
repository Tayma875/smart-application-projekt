# Feature-Umsetzung – Checkliste

Für jedes Feature aus dem SMA-Backlog diese Schritte durchgehen.

## 1. Vorbereitung
- [ ] `docs/spec.md` auf relevante Abschnitte prüfen
- [ ] `docs/backlog.md`: Feature-ID notieren (z. B. SMA-002)
- [ ] `docs/architecture.md` auf betroffene Entitäten prüfen
- [ ] `docs/decisions.md` auf offene Entscheidungen prüfen
- [ ] Akzeptanzkriterien konkret notieren

## 2. Plan
- [ ] Welche Dateien müssen erstellt/geändert werden?
- [ ] Welche Geschäftsregeln gelten?
- [ ] Gibt es Abhängigkeiten zu anderen Features?

## 3. Umsetzung
- [ ] Prisma-Schema (falls neue Felder/Modelle nötig)
- [ ] API-Route(n) (Next.js App Router Route Handler)
- [ ] UI-Komponente(n)
- [ ] Geschäftslogik (Validierung, Limits, Berechtigungen)
- [ ] Migration ausführen (`npx prisma migrate dev`)

## 4. Verifikation
- [ ] Lokal starten und testen (`npm run dev`)
- [ ] Alle Akzeptanzkriterien erfüllt?
- [ ] Existierende Features nicht kaputt?

## 5. Abschluss
- [ ] `docs/backlog.md` auf `done` setzen
- [ ] Notiz mit Commit-Hinweis ergänzen
- [ ] `docs/decisions.md` aktualisieren (falls nötig)
- [ ] `docs/architecture.md` aktualisieren (falls nötig)
- [ ] Commit mit Feature-ID
