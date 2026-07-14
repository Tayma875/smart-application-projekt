#!/bin/bash
# Führt Prisma-Migration und Seed aus

echo "=== Prisma Migration ==="
npx prisma migrate dev --name "$1" 2>/dev/null || npx prisma migrate dev

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Seed ==="
    npx tsx prisma/seed.ts 2>/dev/null || echo "Keine Seed-Datei gefunden (prisma/seed.ts)"
    echo ""
    echo "✅ Migration erfolgreich"
else
    echo "❌ Migration fehlgeschlagen"
    exit 1
fi
