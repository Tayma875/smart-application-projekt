#!/bin/bash
# Zeigt den aktuellen Backlog-Fortschritt an

BACKLOG="docs/backlog.md"

if [ ! -f "$BACKLOG" ]; then
    echo "Fehler: $BACKLOG nicht gefunden"
    exit 1
fi

echo "=== Backlog-Fortschritt ==="
echo ""

total=$(grep -c '| SMA-' "$BACKLOG")
done_count=$(grep -c '| done |' "$BACKLOG")
in_progress=$(grep -c '| in-progress |' "$BACKLOG")
hypo=$(grep -c '| hypo |' "$BACKLOG")
killed=$(grep -c '| killed |' "$BACKLOG")

echo "Gesamt: $total"
echo "Done:   $done_count"
echo "In Progress: $in_progress"
echo "Hypo:   $hypo"
echo "Killed: $killed"
echo ""

if [ "$total" -gt 0 ]; then
    pct=$((done_count * 100 / total))
    echo "Fortschritt: ${pct}%"
fi

echo ""
echo "=== Offene Items (hypo) ==="
grep '| hypo |' "$BACKLOG" | while IFS='|' read -r _ id name phase _ rest; do
    echo "  $(echo "$id" | xargs) - $(echo "$name" | xargs)"
done

echo ""
echo "=== In Progress ==="
grep '| in-progress |' "$BACKLOG" | while IFS='|' read -r _ id name _ _ rest; do
    echo "  $(echo "$id" | xargs) - $(echo "$name" | xargs)"
done
