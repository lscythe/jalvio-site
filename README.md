# Jalvio website

Marketing and waitlist site for Jalvio, built from the "Countdown bento with Jali" website design.

Astro renders the page to static HTML. Svelte islands handle the parts that move: the live countdown with Jali, the waitlist form, the app preview phone and the theme toggle. Everything else ships without JavaScript; the FAQ is a native exclusive `<details>` accordion that a small script animates.

## Commands

Uses [Bun](https://bun.sh).

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `bun install`     | Install dependencies and the git hooks         |
| `bun run dev`     | Start the dev server                           |
| `bun run test`    | Run the Vitest suite                           |
| `bun run check`   | Type-check Astro and Svelte files              |
| `bun run lint`    | Lint and check formatting with Biome           |
| `bun run format`  | Apply Biome fixes and formatting               |
| `bun run build`   | Build the static site into `dist/`             |
| `bun run preview` | Serve the built site                           |
| `bun run deploy`  | Build and deploy to Cloudflare Workers by hand |

## Git hooks

[Lefthook](https://lefthook.dev) runs the hooks in `lefthook.yml`:

- **pre-commit**: Biome fixes and formats the staged files and re-stages them.
- **pre-push**: type-check and tests.

## Deployment

`.github/workflows/ci.yml` lints, type-checks, tests and builds every pull request and every push to `main`. Pushes to `main` then deploy `dist/` to Cloudflare Workers as static assets (`wrangler.jsonc`).

The repository needs:

| Name                       | Kind     | Purpose                                                        |
| -------------------------- | -------- | -------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`     | Secret   | API token with the "Edit Cloudflare Workers" permission        |
| `CLOUDFLARE_ACCOUNT_ID`    | Secret   | The Cloudflare account to deploy to                            |
| `PUBLIC_WAITLIST_ENDPOINT` | Variable | Waitlist signup URL baked into the build (optional, see below) |

The deploy job runs in the `production` environment, so protection rules set on that environment in GitHub apply.

## Waitlist endpoint

The form posts `{"email": "..."}` as JSON to `PUBLIC_WAITLIST_ENDPOINT` and treats any 2xx response as success. Set it in `.env` locally or as the repository variable above:

```sh
PUBLIC_WAITLIST_ENDPOINT=https://example.com/api/waitlist
```

When it is unset, the form skips the request and shows the thank-you state, which keeps local development working without a backend.

## Theme

The site follows the system light or dark setting. The button in the hero switches to the other theme and remembers the choice in `localStorage`; switching back to the system's theme clears it, so the site follows the system again. Every color token is a `light-dark()` pair generated in `src/lib/theme.ts`, and the page's `color-scheme` picks the side.

## Layout

- `src/pages/index.astro`: the page and its responsive layout
- `src/components/`: `Mascot` (Jali), `HeroLive`, `WaitlistForm`, `BusPhone`, `ThemeToggle`
- `src/lib/`: theme generation, mascot geometry, countdown, waitlist, app preview and accordion logic, page copy
- `src/styles/global.css`: shared tokens and keyframes
- `src/styles/system.css`: motion curves and shape outlines exported from the app's design system
