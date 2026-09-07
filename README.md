# Achievement with AI

A working, independent AI discovery publication for **achievementwithai.com**. Built for curious people and useful to AI agents. Cobalt glass, considered typography, original sources, and the occasional well-placed towel reference.

## Included

- Responsive editorial homepage with original AI-assisted artwork and pointer-responsive depth.
- Search, nine topic filters, sorting, incremental results, and bookmarks kept in the visitor's browser.
- Discovery pages, topic pages, curated projects, and project detail pages.
- Interactive topic chart using real collected feed counts, with 7-day, 30-day, and all-collected windows.
- Daily RSS ingestion from OpenAI, Google DeepMind, Hugging Face, NVIDIA, and MIT News.
- Source attribution, publication dates, feed health, failure fallbacks, and a permanent article archive.
- RSS, JSON Feed, JSON datasets, `llms.txt`, OpenAPI, sitemap, robots.txt, canonical metadata, and Article structured data.
- A submission form that prepares a public GitHub issue for the visitor to review and submit.
- A Buttondown email signup endpoint with validation and double opt-in, enabled after account configuration.
- Reduced motion support, keyboard focus styles, semantic pages, mobile navigation, and no advertising or analytics trackers.
- A small `42` easter egg in the footer.

## Launch on Vercel

1. In Vercel, choose **Add New > Project** and import `AllstarProductionsLLC/achievementwithai.com`.
2. Use the **Other** framework preset, repository root, build command `npm run build`, and output directory `dist`. The included `vercel.json` supplies these settings. Use Node.js 22 or later.
3. Deploy. News, projects, search, bookmarks, RSS, and GitHub submission drafts need no API keys.
4. In **Settings > Domains**, add `achievementwithai.com` and optionally `www.achievementwithai.com`. Follow Vercel's displayed DNS records at your registrar. Choose the apex domain as primary, matching the canonical URLs.
5. Configure the daily deploy hook below, then optionally enable email subscriptions.

The initial repository contains a real feed snapshot and builds without contacting publishers. Future editions are refreshed in GitHub and deployed to Vercel. This does not register a domain, create a Vercel account, or change DNS automatically.

Reference: [Deploying GitHub projects with Vercel](https://vercel.com/docs/git/vercel-for-github).

## Automatic daily editions

`.github/workflows/daily-discoveries.yml` runs at approximately **06:17 UTC daily** and can also be run manually from the Actions tab. GitHub may delay scheduled jobs. Schedules on inactive public repositories may eventually be disabled by GitHub.

The workflow fetches the feeds, runs focused tests, builds, checks local links and data formats, and commits an edition to `main`. It retains entries from unavailable feeds. If every feed fails, the job reports failure and leaves the published edition intact.

For reliable automatic publishing, create a Vercel **Deploy Hook** under **Settings > Git > Deploy Hooks**, targeting `main`. Save its URL as the GitHub Actions repository secret **`VERCEL_DEPLOY_HOOK`**. The workflow requests deployment after saving the edition. Never commit the hook URL.

GitHub Actions must be enabled and allow workflow `contents: write` permission. If you protect `main` against workflow commits later, adapt the refresh job to create content pull requests or grant the intended access. The initial empty repository uses direct content updates.

News uses short publisher excerpts, not generated rewrites. The newest collected story appears in the homepage edition strip. Keyword rules in `src/config.mjs` assign topics. The chart describes this feed sample, not worldwide AI activity. Curated projects remain manually reviewed.

## Enable email subscriptions

RSS is available at `/feed.xml`. Email signup is not advertised as active until a real account is configured.

1. Create a Buttondown publication and complete its sender setup.
2. In Vercel environment variables, set `BUTTONDOWN_API_KEY` to the publication API key, `NEWSLETTER_ENABLED=true`, and `SITE_URL=https://achievementwithai.com`.
3. Redeploy so the form becomes visible. The key stays on the server and is never included in generated HTML.
4. In Buttondown, configure **RSS-to-email** with `https://achievementwithai.com/feed.xml`. Recommended initial cadence: **weekly, Tuesday at 14:00 UTC**. Choose draft creation for review, then enable sending when ready.
5. Test with your own address, confirm the subscription, and verify unsubscribe behavior before promotion.

The endpoint creates subscriptions as `unactivated`, requiring email confirmation. Automated tests use a mock provider and never send email. Real delivery cannot be verified until your account is connected. Buttondown's pricing, limits, and automation availability depend on your plan. Apply suitable Vercel Firewall rate limits when opening public signup. The endpoint validates origin, body size, consent, a honeypot, and email syntax.

References: [Subscriber API](https://docs.buttondown.com/api-subscribers-create), [RSS-to-email](https://docs.buttondown.com/rss-to-email), [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js).

## Story submissions

`/submit/` prepares a GitHub issue. Nothing is sent while typing. The visitor continues to GitHub, reviews the draft, and submits with their GitHub account. Issues are public. No content appears on the site automatically from an issue.

To publish an approved project, edit `content/projects.json`. Add recurring news sources in `src/config.mjs`. Discovery and correction issue templates are included.

## Develop locally

```sh
npm ci
npm run dev
```

Open `http://localhost:4173`. Run `npm run build` after edits and refresh the browser. The development server serves generated pages and the subscription endpoint. Export environment variables in your shell for local email testing. `.env.example` documents their names; `.env` files are not loaded automatically.

```sh
npm run refresh  # fetch an edition and maintain the archive
npm test         # feed safety, failure fallback, subscription behavior
npm run build    # generate the complete publication
npm run check    # verify pages, local links, assets, RSS, and JSON contracts
```

## File guide

| File | Purpose |
| --- | --- |
| `src/render.mjs` | Pages, navigation, and editorial copy |
| `public/assets/site.css` | Design tokens, typography, and responsive layout |
| `public/assets/app.mjs` | Search, bookmarks, chart, motion, and forms |
| `src/config.mjs` | Topics, source feeds, and canonical site settings |
| `src/feed.mjs` | RSS/Atom parsing, validation, classification, and fallbacks |
| `src/cards.mjs` | Shared escaped card rendering |
| `content/news.json` | Current edition and source health |
| `content/archive.json` | Retained stories so old links continue working |
| `content/projects.json` | Curated project listings |
| `scripts/build.mjs` | HTML, feeds, metadata, fonts, and agent resources |
| `api/subscribe.js` | Vercel email signup function |
| `vercel.json` | Build settings, security headers, and feed CORS |

The site uses standards-based HTML, CSS, and JavaScript. No paid database or AI inference API is required. Add forms and calls to action in the page templates, with Vercel functions in `api/` when server processing is needed.

## Design and assets

The geometric logo is an editable SVG in `public/favicon.svg` and the shared header template. `public/assets/possibility-loop.webp` is original AI-assisted conceptual artwork made for this publication, not a photograph of a real product. Fonts are self-hosted DM Sans and Space Grotesk from Fontsource, under their upstream open font licenses. Publisher excerpts and project names remain attributed to their owners.

The design workflow used Sites guidance and reviewed [Anthropic's frontend design guidance](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) for intentional typography, hierarchy, restraint, and useful motion.

## Private review preview

`.openai/hosting.json` identifies the private design preview. Vercel ignores it. The preview is a snapshot and does not run Vercel functions or the GitHub daily schedule. The Vercel deployment becomes the ongoing publication after connection. Preserve the preview identity for later revisions.

Validation covers a full build, local routes and assets, data contracts, and focused security/failure-path tests. Live email delivery, Vercel deployment, and DNS still require verification after account configuration. Browser visual and end-to-end testing were not performed in this workspace.
