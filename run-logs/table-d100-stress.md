# Table d100 Stress Test

**Date:** 2026-06-25
**Build:** https://homebrew-libram.vercel.app

## Test: Paste d100 range table → Transcribe → Save → Browse → Delete

### Input
```
d100 Trinket Effects
Column: Effect
1-4: A small glass bead that glows faintly
5-10: A coin that always lands on its edge
...
96-100: A dice that always rolls the same number
```
(20 range entries expanding to 100 rows)

### Results

| Check | Status | Detail |
|-------|--------|--------|
| Name | ✅ | "Trinket Effects" |
| Description | ✅ | Auto-generated |
| Die Type | ✅ | d100 |
| Column name | ✅ | "Effect" |
| Row count | ✅ | 100 rows (labelled 1–100) |
| Cell values | ❌ | **0/100 cells filled** — all empty |
| Tags | ✅ | trinket, magic, random |
| Save | ✅ | Banner confirmed |
| Browse | ✅ | "Trinket Effects d100" |
| Delete | ✅ | Confirm → removed |

### Key finding
**Prompt correctly expands ranges into 100 individual rows**, but **every cell is empty** — same symptom for both d20 and d100. This confirms Geordi's theory of a front-end state race: `setDieType()` being called after the parsed data arrives causes the cells-overwrite that eats the values.

The prompt itself handles d100 fine — all 100 rows structured correctly, just no text in them.

### Log written to
`~/homebrew-libram/run-logs/table-d100-stress.md`