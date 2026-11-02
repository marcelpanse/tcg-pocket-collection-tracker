---
name: import-pokemon-zone
description: Download the Pokémon Zone game-data and card-data JSON through a real browser (to get past Cloudflare) and run `pnpm import-pokemon-zone`. Use when asked to import/refresh/update card data from Pokémon Zone.
---

# Import Pokémon Zone data

Fetching the Pokémon Zone API from Node/curl gets blocked by Cloudflare, so the two JSON files are
downloaded through Chrome using the chrome-devtools MCP tools, then the import script is run.

| URL | Saved to (repo root) |
| --- | --- |
| `https://www.pokemon-zone.com/api/game/game-data/` | `pz-game-data.json` (~0.5 MB) |
| `https://www.pokemon-zone.com/api/game/card-data/` | `pz-card-data.json` (~75 MB) |

Both files are gitignored. Use absolute paths (repo root = current working directory).

## Steps

1. **Open the first URL** with `new_page` (`url: https://www.pokemon-zone.com/api/game/game-data/`).
   Note the returned page id.

2. **Check Cloudflare let us through**: `evaluate_script` with `waitForStableDom: false` and
   `() => document.body.innerText.slice(0, 100)`. It must start with `{`.
   If it shows a Cloudflare challenge ("Verify you are human", "Just a moment…"), wait a few seconds
   and check again; if a checkbox challenge persists, ask the user to click it in the open Chrome
   window, then re-check. Never paste the page body inline — it is huge.

3. **Save to disk** with `evaluate_script`:
   - `function`: `() => JSON.parse(document.body.innerText)`
   - `waitForStableDom`: `false`
   - `filePath`: `<repo root>/pz-game-data.json`

   The `filePath` option writes the returned value as raw JSON, keeping it out of the context.

4. **Repeat for card-data**: `navigate_page` (same page id, `type: url`,
   `url: https://www.pokemon-zone.com/api/game/card-data/`), do the check from step 2, then step 3
   with `filePath: <repo root>/pz-card-data.json`.

5. **Validate** both files parse and have the expected top-level keys:
   ```bash
   node -e "for (const [f,k] of [['pz-game-data.json','packs'],['pz-card-data.json','cards']]) { const d=require('./'+f); if(!d[k]) throw new Error(f+' missing '+k); console.log(f, 'ok') }"
   ```
   Expected keys — game-data: `packs, expansions, packCardIds, rarities, …`; card-data: `cards, cardSkins, cardFrames`.

6. **Close the tab** with `close_page`.

7. **Run the import** (takes a while — it also downloads pack/card images and regenerates hashes):
   ```bash
   pnpm run import-pokemon-zone
   ```
   Use a generous timeout (or run in background).

8. **Report**: summarize the script's output and `git status --short` / `git diff --stat` so the user
   can see what changed in `frontend/assets/cards.json`, images, hashes and SQL. Do not commit unless asked.
