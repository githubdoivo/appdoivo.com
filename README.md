# appdoivo.com

[![CI](https://github.com/githubdoivo/appdoivo.com/actions/workflows/ci.yml/badge.svg)](https://github.com/githubdoivo/appdoivo.com/actions/workflows/ci.yml)

**App do Ivo**: the hub for the apps Ivo Lopes builds, as a bookshelf in warm afternoon light
(a dark wall and a candle by night). Each app is one object on the shelf with its name on a
parchment plate; on a computer they share one shelf, on a phone each gets its own.

| Object | App | Address |
| --- | --- | --- |
| Jar with a mossy cottage | Festa, the birthday party app | demo: https://festa-demo.appdoivo.com |
| Star globe | Astro, the sky at any moment | https://astro.appdoivo.com |
| Typewriter and tape measure | Job, a CV tailored to every job | https://job.appdoivo.com |
| Glass dome with a sprout | Soon, more to come | (not a link) |

## Adding an app

1. In the same ChatGPT chat as the design, ask for the new object (prompt in
   `~/Downloads/appdoivo-refs/PROMPTS-shelf.md`, "Later: every new app").
2. Cut it out (macOS subject lifting), save it as `img/shelf/<id>.webp`, about 800 px.
3. Add it to `APPS` and its name and line to both languages in `index.html`.

Images are never shown larger than they are (a test checks it), so the page stays sharp.
English and Portuguese, labels in Title Case in both. Light and dark follow the device until
the moon/sun button is used.

`npm test` runs the Playwright tests.
