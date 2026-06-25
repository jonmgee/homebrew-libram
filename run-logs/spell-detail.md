# Spell Detail-View Test (commit 5c06e23)

**Entry:** Tasha's Uncontrollable Flatulence

## Results

| Element | Status | Value |
|---------|--------|-------|
| ← Back link | ✅ | /browse/arcana/spells |
| Title (h1) | ✅ | Tasha's Uncontrollable Flatulence |
| Level/school line | ✅ | "2nd conjuration" |
| **Grid fields** | | |
| Casting Time | ✅ | 1 action |
| Range | ✅ | 60ft |
| Components (V/S/M) | **❌ MISSING** | Not in grid |
| Duration | ✅ | Instantaneous |
| Description | ✅ | "Target must make a CON save..." |
| Tags | ✅ | conjuration |
| Source/Campaign | ❌ | Not rendered |

## Key Finding

Components row (V/S/M + material) is **still absent from the grid**. The DB has this data (confirmed in Phase 2 save), but `SpellDetail` component doesn't map it into the grid fields array.

The shared footer fix works — description and tags now render. Source/campaign is also not showing.

## Screenshot
`spell-detail-screenshot.png` — saved locally