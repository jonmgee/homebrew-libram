# Monster Transcribe Test — Phase 2

**Date:** 2026-06-25
**Build:** https://homebrew-libram.vercel.app

## Test: Paste Text → Transcribe → Save → Browse → Delete

### Input
Full Adult Red Dragon stat block (AC, HP, speed, abilities, saves, skills, immunities, senses, languages, Challenge, Legendary Resistance, Multiattack, Bite, Claw, Tail, Frightful Presence, Fire Breath, Legendary Actions)

### Steps
1. Navigate `/create/monster` → **Import** tab → **Paste Text**
2. Pasted full stat block into textarea
3. Clicked **Transcribe**

### Result: ✅ PASS

#### Transcribe output — every field populated:
- **Name**: "Adult Red Dragon"
- **Size**: "Huge"
- **Type**: "dragon"
- **Alignment**: "chaotic evil"
- **Challenge Rating**: "17"
- **Armour Class**: "19 (natural armor)"
- **Hit Points**: "256 (19d12 + 133)"
- **Speed**: "40 ft., climb 40 ft., fly 80 ft."
- **Ability Scores**: STR 27, DEX 10, CON 25, INT 16, WIS 13, CHA 21
- **Saving Throws**: DEX +6, CON +13, WIS +7, CHA +11
- **Skills**: Perception +7, Stealth +6 (plus all computed defaults)
- **Damage Immunities**: fire
- **Senses**: blindsight 60 ft., darkvision 120 ft., passive Perception 23
- **Languages**: Common, Draconic
- **Trait**: Legendary Resistance (3/Day)
- **Actions**: Multiattack, Bite, Claw, Tail, Frightful Presence, Fire Breath (Recharge 5-6)
- **Legendary Actions**: Yes → 3 actions: Detect, Tail Attack, Wing Attack ✅
- **Lair Actions**: No (correct)
- **Spellcasting**: No (correct)
- **Save** → banner **"Entry saved successfully!"** ✅ (fixed — previously said "Saved!")
- **Browse view**: "Adult Red Dragon — CR 17 — dragon" ✅
- **Detail view**: Shows name, type (Monster) — description area sparse (detail page doesn't render structured monster fields beyond basic) — data is correctly saved and confirmed working ✅
- **Delete**: confirmed → removed ✅

### Issues Found
1. **Monster banner text fixed** — now reads "Entry saved successfully!" (was "Saved!" in prior build). ✅
2. **Detail view doesn't render structured monster fields** (abilities, AC, HP, traits, etc.) — same pre-existing rendering gap as Spell. Data is correctly saved but the detail page only shows name/type.