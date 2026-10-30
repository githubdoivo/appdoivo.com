# appdoivo.com

[![CI](https://github.com/githubdoivo/apps/actions/workflows/ci.yml/badge.svg)](https://github.com/githubdoivo/apps/actions/workflows/ci.yml)

**App do Ivo**: the hub for the apps Ivo Lopes builds, drawn as a ball-and-stick
molecule. The centre atom is App do Ivo; each app is an atom bonded to it.

| Atom | App | Address |
| --- | --- | --- |
| Fe (red) | Festa, the birthday party app | demo: https://festa-demo.appdoivo.com (real app: festa.appdoivo.com, party time only) |
| As (blue) | Astro, the sky right now | https://astro.appdoivo.com |

English and Portuguese: `?lang=`, then the visitor's last choice, then the browser's language.

## Files

Everything is in `index.html` (styles, words in both languages, the small script) plus `img/`:

| File | What it is |
| --- | --- |
| `img/paper.webp` | The graph paper |
| `img/atom-*.webp` | Glass atoms (orange = App do Ivo, blue = Festa, purple = Astro; olive, yellow and pink are spare for new apps) |
| `img/ring-big.webp`, `img/ring-small.webp` | The pencil rings and crosshairs |
| `img/rod.png`, `img/dash.png` | A slice of the steel bond (stretched to any length) and one dash of a dotted bond |

All cut out of the ChatGPT images in `~/Downloads/apps-refs/v1/` (green-screen sheets).

- **App do Ivo (Ai)** is the contact: it opens an email to mail@ivolopes.com.
- **The atoms show only their initials.** The details (name, one line, link) appear on hover
  or keyboard focus with a mouse, and always on phones (no hover there).
- **The pale empty atoms** are room for apps to come.
- **Add an app:** copy an `<a class="atom …">` block with a spare atom image, add its
  `.bond` (`data-to` = its id), its position (`--x --y --d`) for desktop and for phones
  (the `max-aspect-ratio: 4/5` block), its label side, and its words in `en` and `pt`.
  Turn one of the empty atoms into it so the molecule keeps its balance.

## Rules

- EN labels in Title Case; PT in sentence case, impersonal.
- Tap targets 44px or more; no sideways scroll; labels never overlap (tested).

`npm test` runs the Playwright tests (desktop + phone). Hosted on GitHub Pages.
