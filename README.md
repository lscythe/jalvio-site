# Jalvio website

Marketing and waitlist site for Jalvio, built from the "Countdown bento with Jali" website design.

Astro renders the page to static HTML. Svelte islands handle the parts that move: the live countdown with Jali, the waitlist form, the app preview phone and the theme toggle. Everything else ships without JavaScript; the FAQ is a native exclusive `<details>` accordion that a small script animates.

## Commands

Uses [Bun](https://bun.sh).

| Command              | What it does                                                            |
| -------------------- | ----------------------------------------------------------------------- |
| `bun install`        | Install dependencies and the git hooks                                  |
| `bun run dev`        | Start the Astro dev server (no API, so waitlist signups fail)           |
| `bun run dev:worker` | Build, migrate the local database and run the site with its API         |
| `bun run test`       | Run the Vitest suite                                                    |
| `bun run check`      | Type-check the site and the Worker                                      |
| `bun run lint`       | Lint and check formatting with Biome                                    |
| `bun run format`     | Apply Biome fixes and formatting                                        |
| `bun run build`      | Build the static site into `dist/`                                      |
| `bun run preview`    | Serve the built site                                                    |
| `bun run deploy`     | Build, migrate the production database and deploy to Cloudflare by hand |

## Git hooks

[Lefthook](https://lefthook.dev) runs the hooks in `lefthook.yml`:

- **pre-commit**: Biome fixes and formats the staged files and re-stages them.
- **pre-push**: type-check and tests.

## Deployment

`.github/workflows/ci.yml` lints, type-checks, tests and builds every pull request and every push to `main`. Pushes to `main` then apply pending D1 migrations and deploy the Worker with `dist/` as its static assets (`wrangler.jsonc`).

The repository needs two secrets:

| Name                    | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token with the "Workers Scripts: Edit" and "D1: Edit" account permissions |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account to deploy to                                           |

The deploy job runs in the `production` environment, so protection rules set on that environment in GitHub apply.

Dependabot (`.github/dependabot.yml`) opens update PRs every Monday: minor and patch bumps grouped (Astro and Svelte together, dev tooling together, all GitHub Actions together), and each major bump in its own PR.

## Waitlist API

The site and its API are one Cloudflare Worker (`worker/`). Static files are served straight from `dist/`; only `/api/*` reaches the Worker code.

`POST /api/waitlist` takes `{"email": "..."}` as JSON and stores the address, trimmed and lowercased, in the `waitlist` table of the `jalvio-waitlist` D1 database. It answers `201` for a new signup and `200` for one already on the list, so the form never reveals who has signed up. Invalid input gets a `4xx` with an `error` code.

Schema changes are SQL files in `migrations/`, applied in order by `wrangler d1 migrations apply`.

Export the list when invites go out:

```sh
bunx wrangler d1 execute jalvio-waitlist --remote --command "SELECT email, created_at FROM waitlist ORDER BY created_at"
```

## Theme

The site follows the system light or dark setting. The button in the hero switches to the other theme and remembers the choice in `localStorage`; switching back to the system's theme clears it, so the site follows the system again. Every color token is a `light-dark()` pair generated in `src/lib/theme.ts`, and the page's `color-scheme` picks the side.

## Layout

- `src/pages/index.astro`: the page and its responsive layout
- `src/components/`: `Mascot` (Jali), `HeroLive`, `WaitlistForm`, `BusPhone`, `ThemeToggle`
- `src/lib/`: theme generation, mascot geometry, countdown, waitlist, app preview and accordion logic, page copy
- `src/styles/global.css`: shared tokens and keyframes
- `src/styles/system.css`: motion curves and shape outlines exported from the app's design system
- `worker/`: the Cloudflare Worker serving the site and the waitlist API
- `migrations/`: D1 schema migrations

## License

Copyright 2026 Lscythe. Licensed under the [Apache License 2.0](LICENSE). The license does not grant rights to the Jalvio name, logo or mascot (section 6).
