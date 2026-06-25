# Table Transcribe Test — Round 2

**Date:** 2026-06-25
**Build:** https://homebrew-libram.vercel.app (commit 475359e)

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

### Result: ⚠️ STILL FAILING

**Transcribe output:**
- **Name**: "Wilderness Encounters" ✅
- **Description**: "A table of random wilderness encounters." ✅
- **Die Type**: d20 ✅
- **Columns**: Roll (auto), Encounter (named) ✅
- **Rows**: 20 rows created ✅
- **Tags**: wilderness, encounters, random table ✅
- **Save**: Success banner confirmed ✅
- **Browse**: "Wilderness Encounters d20" ✅
- **Detail**: Name, description, tags shown (no table rows rendered — pre-existing) ✅
- **Delete**: Confirmed → removed ✅

#### Cell values: ❌ ALL EMPTY
All 20 encounter textboxes remain empty after transcription. The fix to prompt the AI to expand ranges didn't take effect — the AI is still returning results without individual row texts.

### Summary
The prompt change (commit 475359e) wasn't enough. The AI response does not include expanded row values. This may be a deployment/regeneration issue (Vercel still serving old function), or the prompt change needs to be more explicit about the JSON schema for individual rows.