---
name: scrape-missions
description: Refresh the themed-collection mission JSON (frontend/assets/themed-collections/*-missions.json) from pokemon-zone by driving Orca's built-in browser to export the data, because pokemon-zone's Cloudflare blocks the scraper's direct requests. Use when asked to scrape, update or refresh missions / themed collections.
argument-hint: [SET ...]
allowed-tools: Bash, Read
---

# Scrape missions via the Orca browser

pokemon-zone is behind Cloudflare, which blocks scripted requests. `curl` gets a 403 or a dropped
connection (exit code 56), and a DevTools-MCP-controlled Chrome gets stuck on "Just a moment…" for the
themed-collections pages. Orca's built-in browser loads them normally. So the data is fetched from inside
a pokemon-zone tab in Orca, driven with the `orca` CLI, and the scraper parses the exported file offline:

- `scripts/pokemon-zone-export.js` is a function that runs in the tab. It fetches the card catalog, each
  set's themed-collections page, and every mission's API response as same-origin requests, 400 ms apart.
  It runs in the background: progress is in `window.__pzExport` and the result goes to `window.__pzBundle`.
- `scripts/scrape-missions.ts --bundle <file>` turns the saved bundle into the mission JSON.

**Never solve or click through a Cloudflare challenge yourself.** If one shows up, the user solves it in
the Orca browser tab.

Notes on `orca eval`:
- Its return value is at `.result.result` in the `--json` output. Always return
  `JSON.stringify(...)` and parse that string with `jq -r`.
- Foreground `sleep` is blocked in this environment; the polling loop below uses `perl` to wait.

## Steps

Run all commands from the repo root.

1. **Pick the sets.** Use the set ids from the arguments (e.g. `C1 B4b`), or all sets if none were
   given. Ids are case-sensitive and must match `frontend/src/lib/CardsDB.ts`.

2. **Generate the export function:**
   ```bash
   npx tsx scripts/pokemon-zone-snippet.ts <SET ...>
   ```
   This writes `scripts/.cache/pokemon-zone-export.run.js` and exits non-zero on an unknown set id.

3. **Open pokemon-zone in Orca.** Open a themed-collections page, since those are the ones Cloudflare
   guards, and note the `browserPageId` (`P` below):
   ```bash
   orca tab create --url https://www.pokemon-zone.com/themed-collections/<first set, lowercase> --json
   orca wait --page $P --load networkidle --json
   orca eval --page $P --expression 'document.title' --json | jq -r .result.result
   ```
   If the title is "Just a moment…" or similar, ask the user to complete the check in the Orca tab and
   wait for their confirmation. If `orca` reports that Orca isn't running, see the `orca-cli` skill.

4. **Start the export.** It returns the status right away:
   ```bash
   orca eval --page $P --expression "($(cat scripts/.cache/pokemon-zone-export.run.js))()" --json | jq -r .result.result
   ```
   If `state` is `error`, fix the cause (wrong page, no expansions) and re-run. Calling it again while an
   export is running just returns the current status.

5. **Wait for it to finish** (a single set takes ~15 s; all sets take several minutes):
   ```bash
   for i in $(seq 1 100); do
     s=$(orca eval --page $P --expression 'JSON.stringify(window.__pzExport)' --json | jq -r .result.result)
     echo "$s"; echo "$s" | grep -q '"state":"running"' || break
     perl -e 'select(undef,undef,undef,5)'
   done 2>&1 | tail -3
   ```
   Use a Bash `timeout` of up to 600000 ms. If the loop ends while still `running`, run it again.
   - `state: 'done'`: go to step 6.
   - `state: 'error'` with HTTP 403 or 503: Cloudflare kicked in. Go back to step 3 (`orca reload --page $P`),
     then restart from step 4. The export always starts over.
   - Any other error: stop and report it.

6. **Save the bundle.** It's roughly 80 MB, mostly the card catalog; `scripts/.cache/` is gitignored:
   ```bash
   orca eval --page $P --expression 'JSON.stringify(window.__pzBundle)' --json > scripts/.cache/eval-out.json \
     && jq -r .result.result scripts/.cache/eval-out.json > scripts/.cache/pokemon-zone-export.json \
     && rm scripts/.cache/eval-out.json
   jq -c '{exportedAt, expansions, listings: (.listings|map_values(length)), missions: ([.missions[]|.status]|group_by(.)|map({(.[0]|tostring): length})|add)}' scripts/.cache/pokemon-zone-export.json
   ```
   Then close the tab with `orca tab close`; check `orca tab list --json` for its index.

7. **Run the scraper on the bundle:**
   ```bash
   npx tsx scripts/scrape-missions.ts --bundle scripts/.cache/pokemon-zone-export.json <SET ...>
   ```
   With no set ids it scrapes every set in the bundle. In bundle mode every error is fatal (a missing set
   or mission means the export is incomplete), so re-export rather than work around it.

8. **Run `pnpm lint:fix` first.** The scraper writes one id per line and biome collapses the arrays back.
   Diffing before this step shows hundreds of formatting-only lines.

9. **Review the output before calling it done:**
   - Report every `! unknown pokemon-zone card id` and `! unhandled criterion targetType` warning to the
     user. They mean cards or rules the scraper couldn't map.
   - `git diff --stat frontend/assets/themed-collections/` — only the sets you scraped should change.
     For each changed set, compare with `git show HEAD:<file>` by mission name: list missions that were
     added or removed and slots whose option counts changed. Flag any big drop in option counts: a pool
     mission going down to one option is the fallback kicking in wrongly.
   - Check that no requirement has empty `options` and that every option id exists in
     `frontend/assets/cards.json`, e.g. with a short `node -e` script.
