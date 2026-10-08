# Where Is Your Beach (Walton County Beach Access): architecture

Last checked against the code and Cloudflare on Oct 8, 2026.

## What it does

A static public record of how Walton County beach access got this way: history, timeline, lawsuits, beach nourishment, and documents. A small Worker handles the contact form. No database and no login.

## Domains and Worker

- Worker: `beaches`
- Custom domains: `whereisyourbeach.com`, `www.whereisyourbeach.com`. Unlike most of the other sites, these are declared in `wrangler.jsonc` (`routes` with `custom_domain: true`), so a deploy manages them.
- workers.dev host is disabled.

## Data and images

- Pages, CSS, and photos are static files in this repo (`assets/photos/`, credits in `assets/photos/credits.txt`). Document files are linked, not stored here.
- Bindings: `ASSETS` (static assets, directory `.`). No D1, R2, or KV.
- External services: Resend (contact mail), Google Analytics 4 tag on pages.

## Secrets and env vars (names only)

- Secrets set: `RESEND_API_KEY`, `CONTACT_EMAIL`
- Optional, read by the code but not set today: `CONTACT_FROM` (verified From address).

## Cron and scheduled jobs

None. The Worker has only a fetch handler and no cron trigger.

## How it deploys

- Cloudflare Workers Builds, auto deploy on merge to `main`. Repo `marcongit850/beaches`, trigger `34d8f39f-1b91-439c-b296-5f36267d3df1`, build command empty, deploy command `npx wrangler deploy`, root `/`.
- If a merge does not deploy: `POST /accounts/f1c59948520f1ec39473238b621c7e24/builds/triggers/34d8f39f-1b91-439c-b296-5f36267d3df1/builds` with body `{"branch": "main", "commit_hash": "<full 40 character sha>"}`. Check builds with `GET /accounts/f1c59948520f1ec39473238b621c7e24/builds/workers/c243055bd90b44978c23b74412fc7aef/builds?per_page=2` and match `commit_hash`.

## Known gotchas

- Only `/api/contact` runs the Worker (`run_worker_first`). Every other path is a static asset.
- `CONTACT_FROM` is not set, so mail goes from Resend's onboarding sender (`onboarding@resend.dev`), which only delivers to the Resend account email. If Resend rejects it, the form tells the visitor to set `CONTACT_FROM`.
- `.assetsignore` keeps `worker.js`, `wrangler.jsonc`, `README.md`, and `test/` from being served.
- The Customary Use page (`customary-use.html`) is live but not linked in the navigation.

TODO: decide on a verified Resend From address and set `CONTACT_FROM`.

## Standing rule

Any PR that changes architecture (new secret, cron, storage, binding, or deploy change) must update this file in the same PR.
