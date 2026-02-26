---
name: add-set
description: Add a new TCG Pocket expansion set to the project. Use when asked to add a new set, expansion, or pack.
argument-hint: [set-id]
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Add New Set

Start by asking the user for the following details (ask all in one message):

1. **Set display name** – e.g. `Paldean Wonders`
2. **Set ID** – e.g. `B2a` (used in URLs and card IDs)
3. **Internal ID** – the next integer after the current highest non-promo internalId in `frontend/src/lib/CardsDB.ts` (read the file to determine this automatically and suggest it)
4. **Pack name(s)** – internal key(s) without spaces, lowercase, e.g. `paldeanwonderspack`. If there are multiple packs, ask for all of them.
5. **Pack display name(s)** – the human-readable pack name(s), e.g. `Paldean Wonders`
6. **Pack color(s)** – hex color(s), e.g. `#78b9c0`. Rule: saturation 37.5%, value 75%, hue distance ≥ 3.33% (12 steps) from all existing packs. Read CardsDB.ts to find existing colors and suggest a valid new one.
7. **Tradeable?** – yes/no (default: yes)
8. **Openable?** – yes/no (default: yes)
9. **Contains shinies?** – yes/no (default: yes)
10. **Contains babies?** – yes/no (default: no)
11. **Cards per pack** – number (default: 5)

Once you have all the details, perform **all** of the following steps:

---

## Step 1 — `frontend/src/types/index.ts`

Add the new set ID to the front of the `expansionIds` array:
```ts
export const expansionIds = ['<NEW_ID>', 'B2a', ...] as const
```

---

## Step 2 — `frontend/assets/themed-collections/<ID>-missions.json`

Create the file with an empty array:
```json
[]
```

---

## Step 3 — `frontend/src/lib/CardsDB.ts`

**3a.** Add import at the bottom of the existing imports block:
```ts
const <IdCamel>Missions = await import('../../assets/themed-collections/<ID>-missions.json')
```

**3b.** Add missions variable after the last existing missions variable:
```ts
const <idCamel>Missions: Mission[] = <IdCamel>Missions.default as Mission[]
```

**3c.** Add the expansion entry after the previous set and before the promo sets comment:
```ts
{
  name: '<nameLowercase>',
  id: '<ID>',
  internalId: <internalId>,
  packs: [{ name: '<packname>', color: '<color>' }],
  missions: <idCamel>Missions,
  tradeable: <true|false>,
  openable: <true|false>,
  packStructure: {
    containsShinies: <true|false>,
    containsBabies: <true|false>,
    cardsPerPack: <number>,
  },
},
```

---

## Step 4 — `scripts/scraper.ts`

**4a.** Add each pack name to the `packs` array (before `'allcards'`):
```ts
'<packname>',
```

**4b.** Add the set to `rarityOverrides` (empty for now — fill in after scraping):
```ts
<ID>: [],
```
Place it in the correct alphabetical/sequential position among the other set IDs.

---

## Step 5 — Locale files: `sets.json` (all 6 locales)

Files: `frontend/public/locales/{en-US,es-ES,it-IT,pt-BR,de-DE,fr-FR}/common/sets.json`

For **en-US**, add after the previous set's entry:
```json
"<nameLowercase>": "<Display Name>",
```
And in the ID-suffixed section, add after the previous set's suffixed entry:
```json
"<nameLowercase>(<idLower>)": "<Display Name> (<ID>)",
```

For **all other locales**, append at the end (before the closing `}`):
```json
"<nameLowercase>": "<Display Name>",
"<nameLowercase>(<idLower>)": "<Display Name> (<ID>)"
```
Use the English display name as a placeholder for non-English locales.

---

## Step 6 — Locale files: `packs.json` (all 6 locales)

Files: `frontend/public/locales/{en-US,es-ES,it-IT,pt-BR,de-DE,fr-FR}/common/packs.json`

For **en-US**, add before `"everypack"`:
```json
"<packname>": "<Pack Display Name>",
```

For **all other locales**, append at the end (before the closing `}`):
```json
"<packname>": "<Pack Display Name>"
```

---

## Naming conventions

- `<nameLowercase>` = display name lowercased with all spaces removed, e.g. `Paldean Wonders` → `paldeanwonders`
- `<idLower>` = set ID lowercased, e.g. `B2a` → `b2a`
- `<IdCamel>` = set ID as camelCase import name, e.g. `B2a` → `B2aMissions`
- `<idCamel>` = set ID as camelCase variable, e.g. `B2a` → `b2aMissions`

## Important notes

- `internalId` must **never change** after a set is released — the DB encoding depends on it.
- Promo sets use internalIds 192+ to avoid conflicts with regular sets.
- After all edits are done, remind the user that shiny card rarity ranges in `rarityOverrides` in `scripts/scraper.ts` should be filled in once the set's card list is confirmed.
