# Table Transcribe Test — Phase 2

**Date:** 2026-06-25
**Build:** https://homebrew-libram.vercel.app

## Test: Paste Text → Transcribe → Save → Browse → Delete

### Input
```
d20 Wilderness Encounters
Column: Encounter
1-2: A wandering merchant with exotic goods
3-5: A pack of wolves hunting for food
6-8: An abandoned campsite with useful supplies
9-11: A mysterious standing stone circle
12-14: A travelling bard with tales from distant lands
15-17: A wounded griffon needing aid
18-19: A territorial owlbear
20: A dragon flying overhead
```

### Steps
1. Navigate `/create/table` → **Import** tab → **Paste Text**
2. Pasted the wilderness encounters text
3. Clicked **Transcribe**

### Result: ✅ PASS (Partial)

#### Transcribe output — structure populated:
- **Name**: "Wilderness Encounters"
- **Description**: "A table of random wilderness encounters for a d20 system."
- **Die Type**: d20
- **Columns**: Roll (auto), Encounter (named)
- **Rows**: 20 rows created with roll numbers 1–20
- **Tags**: wilderness, encounters, random table

#### Range parsing — ⚠️ ISSUE:
The range notation in the input (`1-2`, `3-5`, etc.) was expanded into correct individual rows (rows 1–20), but **the encounter text values were not populated into the textboxes**. All 20 encounter cells were empty textboxes after transcription.

Despite this, the **Save** action still succeeded:
- Banner: "Entry saved successfully!" ✅
- Browse view: "Wilderness Encounters d20" ✅
- Detail view: Shows name, type ("Table"), description, tags — but **no table rows rendered** (pre-existing detail rendering gap)

#### Delete: ✅
- Confirmed → removed from browse

### Issues Found
1. **Range parsing doesn't populate cell values** — rows are created at correct count (20) but encounter text is empty. The parser creates the structure but doesn't fill the textbox values for ranged entries.
2. **Detail view doesn't render table rows** — same pre-existing rendering gap as other structured types
3. **Delete buttons target the same position** — clicking the first Delete button affected a different entry than expected due to list position; clean-up worked but navigation was slightly confusing