# appdoivo.com

[![CI](https://github.com/githubdoivo/appdoivo.com/actions/workflows/ci.yml/badge.svg)](https://github.com/githubdoivo/appdoivo.com/actions/workflows/ci.yml)

**App do Ivo**: the hub for the apps Ivo Lopes builds: one painted scene of a bookshelf in
afternoon light (dimmed with a candle glow by night), one object per app on the shelf, no plaques and no text on the page.
Pointing at or tapping an object lights a small warm glow on it and shows its name under it.
A wide scene for computers, a tall one for phones (`img/scene/`, from ChatGPT; originals in
`~/Downloads/appdoivo-refs/scene/`). 

| Object | App | Address |
| --- | --- | --- |
| Jar with a mossy cottage | Festa, the birthday party app | demo: https://festa-demo.appdoivo.com |
| Star globe | Astro, the sky at any moment | https://astro.appdoivo.com |
| Typewriter and tape measure | Job, a CV tailored to every job | https://job.appdoivo.com |
| Glass dome with a sprout | Soon, more to come | (not a link) |

## Adding an app

1. In the ChatGPT chat of the design, ask for both scenes again with the new object on its
   own stand with a blank label (and every other object in the same place).
2. Save them as `img/scene/shelf-desk.webp` and `shelf-phone.webp` (bump `?v=`).
3. Add the app to `APPS` and its words to both languages in `index.html`, and measure its box
   in `SCENES` (open the page with `?debug` to see the boxes over the picture).

The scene fills the whole screen like a background (no frame, no title on top); a test checks it covers every screen shape and that every label's words fit.
English and Portuguese, labels in Title Case in both. Light and dark follow the device until
the moon/sun button is used.

`npm test` runs the Playwright tests.
