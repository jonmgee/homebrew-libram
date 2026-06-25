# Table Transcribe Test — Round 5 (Both Fixes Confirmed Live)

**Date:** 2026-06-25
**Build:** https://homebrew-libram.vercel.app (bundle `index-Fe_ba3bx.js`, commit 5c7b8a9)

## Test A — d20 Wilderness Encounters

### Result: ✅ PASS

| Check | Status | Detail |
|-------|--------|--------|
| Name | ✅ | "Wilderness Encounters" |
| Description | ✅ | Auto-generated |
| Die Type | ✅ | d20 |
| Column name | ✅ | "Encounter" |
| Row count | ✅ | 20 rows |
| **Cell values** | **✅** | **20/20 filled** — ranges correctly expanded |
| Tags | ✅ | wilderness, encounters, random table |
| Save | ✅ | Banner confirmed |
| Browse | ✅ | "Wilderness Encounters d20" |
| Delete | ✅ | Confirmed → removed |

**Sample cells:**
- Row 1: "A wandering merchant with exotic goods"
- Row 2: "A wandering merchant with exotic goods"
- Row 20: "A dragon flying overhead"

## Test B — d100 Trinket Effects

### Result: ✅ PASS

| Check | Status | Detail |
|-------|--------|--------|
| Name | ✅ | "Trinket Effects" |
| Description | ✅ | Auto-generated |
| Die Type | ✅ | d100 |
| Column name | ✅ | "Effect" |
| Row count | ✅ | 100 rows |
| **Cell values** | **✅** | **100/100 filled** — all 20 ranges expanded |
| Tags | ✅ | auto-generated |
| Save | ✅ | Banner confirmed |
| Browse | ✅ | "Trinket Effects d100" |
| Delete | ✅ | Confirmed → removed |

**Sample cells:**
- Row 1: "A small glass bead that glows faintly"
- Row 25: "A stone that hums when held"
- Row 50: "A mirror that shows your reflection as a child"
- Row 75: "A quill that writes in gold ink"
- Row 100: "A dice that always rolls the same number"

## Summary

**Both fixes are confirmed working.** The dual guard (`!dieType && !parsedData` + early-return on correctly-sized cells) resolved the race condition that was wiping cell values. The AI prompt expansion also works correctly for both d20 and d100.

**Table parser status: ✅ FIXED**

Phase 2 — all 14 entry types now passing with Paste Text + DeepSeek.