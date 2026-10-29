# appdoivo.com

[![CI](https://github.com/githubdoivo/apps/actions/workflows/ci.yml/badge.svg)](https://github.com/githubdoivo/apps/actions/workflows/ci.yml)

**App do Ivo**: the hub for the apps Ivo Lopes builds, drawn as a ball-and-stick
molecule. The centre atom is App do Ivo; each app is an atom bonded to it.

| Atom | App | Address |
| --- | --- | --- |
| Fe (red) | Festa, the birthday party app | demo: https://festa-demo.appdoivo.com (real app: festa.appdoivo.com, party time only) |
| As (blue) | Astro, astrology | astro.appdoivo.com (soon; dotted bond) |

English and Portuguese: `?lang=`, then the visitor's last choice, then the browser's language.

## Files

Everything is in `index.html` (styles, words in both languages, the small script).

- **Add an app:** add an `<a class="atom …">` inside `.molecule`, a `<line data-from="core" data-to="…">`
  in `.bonds`, its position (`--x --y --d --c`) for desktop and for phones (the
  `max-aspect-ratio: 4/5` block), and its words in both `en` and `pt`.
  A dotted bond (`class="soon"`) means not ready yet. The script draws each bond from ball to ball.
- **Redesign:** this is a simple first version; the final look will come from a
  ChatGPT mockup and replace the CSS (and maybe the atoms' art).
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-image.png` (the link preview).

## Rules

- EN labels in Title Case; PT in sentence case, impersonal.
- Tap targets 44px or more; no sideways scroll; labels never overlap (tested).

`npm test` runs the Playwright tests (desktop + phone). Hosted on GitHub Pages.
