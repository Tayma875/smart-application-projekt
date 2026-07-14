#!/bin/bash
# Ermittelt das nächste zu implementierende Feature aus dem Backlog

BACKLOG="docs/backlog.md"

if [ ! -f "$BACKLOG" ]; then
    echo "Fehler: $BACKLOG nicht gefunden"
    exit 1
fi

echo "=== Nächstes Feature ==="
echo ""

# Phase-Reihenfolge: 1, 2, 3, 4
for phase in 1 2 3 4; do
    feature=$(grep "| SMA-" "$BACKLOG" | grep "| $phase |" | grep "| hypo |" | head -1)
    if [ -n "$feature" ]; then
        echo "Phase $phase:"
        echo "$feature" | awk -F'|' '{print "  " $2 " -" $3}'
        echo ""
        echo "Info: ./scripts/set-status.sh $(echo "$feature" | awk -F'|' '{print $2}' | xargs) in-progress"
        exit 0
    fi
done

echo "Keine offenen Features gefunden. Alle Phasen abgeschlossen? 🎉"
