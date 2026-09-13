# Homebrew classes and species — the contract with PC on Parchment

The Libram stores homebrew classes and species. PC on Parchment reads them to
fill in a character sheet the same way it already does for SRD classes and
species. This file is the only thing the two apps agree on, so treat every key
below as load-bearing: renaming one on either side silently breaks the other.

Scope: the **2024 (5.5e) sheet only**. Multiclassing rules are not part of v1.

## Where the data lives

- Table `entries`, Supabase project `lebticyakvkencowjxmb` (shared login).
- `type` is `"species"` or `"class"` (plain text column, no constraint).
- `name` is the entry name, `description` is markdown lore.
- Everything below lives in the `properties` JSONB column.
- RLS: a user only ever sees their own rows (`auth.uid() = user_id`).
- `properties.image_url` may be present; ignore it.

Every class and species is saved through a Libram form that normalises it into
exactly these shapes (readers in `src/lib/characterOptions.ts`). Still read
defensively — a missing key should mean "no value", never a crash.

## `type: "species"`

| key | type | notes |
|---|---|---|
| `creature_type` | string | Almost always `"Humanoid"`. |
| `sizes` | string[] | From `"Tiny"`, `"Small"`, `"Medium"`, `"Large"`. More than one = the player chooses (like the SRD Human). Never empty. |
| `speed` | number | Walking speed in feet. |
| `traits` | `{ name: string; desc: string }[]` | May be absent when there are none. `desc` is markdown. |

Maps onto PC on Parchment's existing shapes:

- `SrdSpecies` ← `{ name: entry.name, sizes, speed }`
- `SrdSpeciesTrait[]` ← each trait as `{ species: entry.name, name, summary: desc }`

## `type: "class"`

| key | type | notes |
|---|---|---|
| `hit_die` | number | 6, 8, 10 or 12. |
| `primary_ability` | string | Display text only, e.g. `"Strength or Dexterity"`. |
| `saves` | AbilityKey[] | Lower-case `"str"`…`"cha"`, in that order. Usually two. |
| `spell_ability` | AbilityKey | **Absent** for a non-caster. |
| `armor_training` | `{ light, medium, heavy, shields }` | All booleans. |
| `weapon_profs` | string | Free text, `""` if none. |
| `tool_profs` | string | Free text, `""` if none. |
| `skill_choose` | number | How many skills to pick. |
| `skill_options` | string[] | PC on Parchment skill ids (`"animal-handling"`, `"sleight-of-hand"`…). **Empty = choose from any**, as with the Bard. |
| `starting_equipment` | string | Display text only; not added to inventory. |
| `subclass_level` | number | Level the subclass is chosen. 3 unless the author changed it. |
| `features` | `{ level: number; name: string; desc: string }[]` | Sorted by level. A feature gained at several levels (Ability Score Improvement) is one row per level. `desc` is markdown. |
| `resources` | `{ name: string; by_level: number[]; pool?: true }[]` | `by_level` is **always exactly 20** whole numbers, index 0 = level 1, 0 until gained. `pool` present only when true. |

Maps onto PC on Parchment's existing shapes:

- `SrdClass` ← `hitDie: hit_die`, `saves`, `spellAbility: spell_ability`,
  `armorTraining: armor_training`, `weaponProfs: weapon_profs`,
  `toolProfs: tool_profs`, `skillChoose: skill_choose`,
  `skillOptions: skill_options`, `multiclass`: no grants (all false / empty),
  `multiclassPrereq: []`.
- `SrdClassFeature[]` ← group `features` by `name`:
  `{ className: entry.name, name, levels: [every level it appears at], summary: desc }`.
- `SrdClassResource[]` ← each resource as
  `{ className: entry.name, name, byLevel: by_level, pool }`.

Spell slots stay hand-entered on the sheet, exactly as for SRD classes.

## Name matching

- Match what the player types against `entry.name`, ignoring case and
  surrounding whitespace — the same rule as `findSrdClass` / `findSrdSpecies`.
- **SRD first, homebrew second.** If a homebrew entry shares an SRD name the
  SRD one wins. The Libram warns authors about this and suggests a suffix
  (`"Warlock HB"`), so both can exist.
- If two of the user's own entries share a name, take the most recently
  created one.

## Gotcha for the sheet side

`findSrdClass` and `findSrdSpecies` are synchronous and called during render.
Libram rows arrive asynchronously. Fetch the user's `class` and `species`
entries once when the sheet loads, hold them in state, and have both lookups
consult that list after the SRD list — rather than fetching inside render or
per keystroke.

---

## Handoff prompt for the PC on Parchment session

> Homebrew Libram now stores homebrew classes and species (entries with
> `type` "class" and "species"). Read
> `~/Desktop/Claude Code/Homebrew Libram/docs/class-species-contract.md` — it
> is the contract for their `properties` shape — and make the 2024 (5.5e)
> sheet treat them exactly like SRD classes and species: the auto-fill offer
> when a class or species name is typed, the level-up feature offers, and the
> limited-use tracker raises. Match SRD names first, homebrew second. Don't
> touch the 2e sheet, and leave spell slots manual. `libram.ts` currently says
> there is no species or class type in the Libram — that's no longer true.
> Don't start building until you've shown me the plan.
