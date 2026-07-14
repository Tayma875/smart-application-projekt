#!/bin/bash
# Setzt den Status eines Backlog-Items
# Usage: set-status.sh <SMA-NNN> <status>

BACKLOG="docs/backlog.md"

if [ $# -ne 2 ]; then
    echo "Usage: $0 <SMA-NNN> <status>"
    echo "  status: hypo, validated, in-progress, done, killed"
    exit 1
fi

ID="$1"
STATUS="$2"

if [ ! -f "$BACKLOG" ]; then
    echo "Fehler: $BACKLOG nicht gefunden"
    exit 1
fi

case "$STATUS" in
    hypo|validated|in-progress|done|killed) ;;
    *) echo "Ungültiger Status: $STATUS (erlaubt: hypo, validated, in-progress, done, killed)"; exit 1 ;;
esac

if grep -q "| $ID |" "$BACKLOG"; then
    # Plattformsichere Ersetzung
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/| $ID |.*| hypo |/| $ID |&| $STATUS |/" "$BACKLOG"
        # Korrektur: wir ersetzen direkt die Status-Spalte (5. Spalte in der Tabelle)
        sed -i '' "/| $ID |/s/| hypo |/| $STATUS |/" "$BACKLOG"
        sed -i '' "/| $ID |/s/| validated |/| $STATUS |/" "$BACKLOG"
        sed -i '' "/| $ID |/s/| in-progress |/| $STATUS |/" "$BACKLOG"
        sed -i '' "/| $ID |/s/| done |/| $STATUS |/" "$BACKLOG"
        sed -i '' "/| $ID |/s/| killed |/| $STATUS |/" "$BACKLOG"
    else
        sed -i "/| $ID |/s/| hypo |/| $STATUS |/" "$BACKLOG"
        sed -i "/| $ID |/s/| validated |/| $STATUS |/" "$BACKLOG"
        sed -i "/| $ID |/s/| in-progress |/| $STATUS |/" "$BACKLOG"
        sed -i "/| $ID |/s/| done |/| $STATUS |/" "$BACKLOG"
        sed -i "/| $ID |/s/| killed |/| $STATUS |/" "$BACKLOG"
    fi
    echo "$ID -> $STATUS"
else
    echo "Fehler: $ID nicht in $BACKLOG gefunden"
    exit 1
fi
