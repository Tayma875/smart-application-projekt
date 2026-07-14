# Entscheidungen festhalten

Immer dann in `docs/decisions.md` dokumentieren, wenn:

1. Eine **offene Entscheidung** geklärt wurde (z. B. Premium-Regel, Tech-Stack)
2. Ein **Architektur-Kniff** gewählt wurde (z. B. bestimmtes Pattern)
3. Eine **widersprüchliche Spec** aufgelöst wurde
4. Eine **Implementierungsalternative** verworfen wurde

## Vorlage (in docs/decisions.md)

```markdown
## JJJJ-MM-TT - Titel

**Kontext:** [...]

### Entscheidung
Was wurde gewählt?

### Alternativen verworfen
- Option A: Warum nicht?
- Option B: Warum nicht?

### Konsequenzen
- Positiv
- Negativ / Risiken
```

## Faustregel

"Wenn ich in zwei Monaten eine Begründung für diesen Code brauche,
steht sie in `docs/decisions.md`."
