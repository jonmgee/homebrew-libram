# Subclass Transcribe Test — Phase 2

**Date:** 2026-06-25
**Build:** https://homebrew-libram.vercel.app

## Test: Paste Text → Transcribe → Save → Browse → Delete

### Input
Full School of Evocation text with 5 level features (levels 2, 2, 6, 10, 14)

### Steps
1. Navigate `/create/subclass` → **Import** tab → **Paste Text**
2. Pasted full subclass description with features
3. Clicked **Transcribe**

### Result: ✅ PASS

**Transcribe output — all fields correctly populated:**
- **Name**: "School of Evocation"
- **Parent Class**: "Wizard"
- **Description**: Full descriptive text
- **Level Features**: All 5 features parsed with correct levels:
  - Level 2: Evocation Savant ✅
  - Level 2: Sculpt Spells ✅
  - Level 6: Potent Cantrip ✅
  - Level 10: Empowered Evocation ✅
  - Level 14: Overchannel ✅
- **Tags**: `magic`, `elemental`, `damage`
- **Save** → banner "Entry saved successfully!" ✅
- **Browse view**: shows entry with truncated description ✅
- **Delete**: confirmed → removed ✅

### Issues Found
None. Flawless parsing of level features.