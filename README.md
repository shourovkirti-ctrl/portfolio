# Portfolio

Personal portfolio website for **Shourov**.

Built with AI assistance (Claude Code) and reviewed by a human developer before it goes live.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Linting | ESLint |
| Bundler | Turbopack |
| Package manager | npm |

## Running locally

```bash
npm install
npm run dev
```

The dev server starts at http://localhost:3000

Other scripts:

```bash
npm run build
npm run lint
```

## Repository layout

```
src/app/        App Router pages, layouts and global styles
public/         Static assets (images, icons, fonts)
```

---

## For the reviewing developer

**Branching model**

- `main` — reviewed and approved code only. Nothing lands here without a merged PR.
- `dev` — active development branch. All AI-assisted work is committed here.

**How to review**

1. Open the Pull Request from `dev` into `main`.
2. Comment inline on the diff for anything that needs changing.
3. Approve and merge when it looks good — `main` is what gets deployed.

**Things worth checking in review**

- Accessibility: semantic HTML, alt text, keyboard navigation, colour contrast.
- Responsive behaviour on mobile, tablet and desktop.
- No secrets or API keys committed (`.env*` is gitignored).
- Lighthouse / Core Web Vitals before deploying.

**Deployment** is not configured yet. Vercel is the natural fit for Next.js, but the final call is the reviewing developer's.

## Notes

`AGENTS.md` and `CLAUDE.md` hold instructions for AI coding agents working in this repo. They do not affect the built site.
