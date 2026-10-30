import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch (_) {} });
});

test("the scene renders every app, with no errors or missing files", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith("http://localhost")) errors.push(`${r.status()}: ${r.url()}`); });
  await page.goto("/?lang=en");
  await expect(page.locator("h1")).toHaveText("App do Ivo");
  await expect(page.locator(".app")).toHaveCount(4);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
  const broken = await page.$$eval("img", (ims) => ims.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
  expect(broken).toEqual([]);
  for (const f of ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "og-image.png"]) expect((await page.request.get(`/${f}`)).status(), f).toBe(200);
  expect(errors).toEqual([]);
});

test("each object links to its app and says where it goes; Soon is not a link", async ({ page }) => {
  await page.goto("/?lang=en");
  await expect(page.locator("a.app.festa")).toHaveAttribute("href", "https://festa-demo.appdoivo.com");
  await expect(page.locator("a.app.astro")).toHaveAttribute("href", "https://astro.appdoivo.com");
  await expect(page.locator("a.app.job")).toHaveAttribute("href", "https://job.appdoivo.com");
  await expect(page.locator("a.app.festa")).toHaveAccessibleName(/Festa.*Celebrate/);
  await expect(page.locator("a.app.soon")).toHaveCount(0);
  await expect(page.locator("footer a")).toHaveAttribute("href", "mailto:mail@ivolopes.com");
});

test("images are never shown larger than they are (always sharp)", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/?lang=en");
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
  const blown = await page.$$eval("img", (ims) => ims.filter((i) => i.naturalWidth && i.getBoundingClientRect().width > i.naturalWidth / 1 + 1).map((i) => `${i.src.split("/").pop()} ${Math.round(i.getBoundingClientRect().width)}>${i.naturalWidth}`));
  expect(blown).toEqual([]);
});

test("the phone gets the tall scene, the computer the wide one; the labels sit inside the picture", async ({ page, isMobile }) => {
  await page.goto("/?lang=en");
  await expect(page.locator("#scene-img")).toHaveAttribute("src", isMobile ? /moody-phone/ : /moody-desk/);
  const pic = await page.locator("#scene-img").boundingBox();
  for (const l of await page.locator(".label").all()) {
    const b = await l.boundingBox();
    expect(b.x >= pic.x && b.x + b.width <= pic.x + pic.width + 1 && b.y + b.height <= pic.y + pic.height + 1).toBe(true);
  }
  // the words fit their labels
  expect(await page.$$eval(".label", (ls) => ls.filter((l) => l.scrollWidth > l.clientWidth + 1).length)).toBe(0);
});

test("Portuguese, Title Case like the English", async ({ page }) => {
  await page.goto("/?lang=pt");
  await expect(page.locator(".tagline")).toHaveText("Pequenas Apps para uma Vida Maior");
  await expect(page.locator(".app.soon .label b")).toHaveText("Em Breve");
  await expect(page.locator("a.app.astro")).toHaveAccessibleName(/O Céu/);
});

test("dark mode switch, sideways scroll, 44px targets, no serious accessibility problems", async ({ page }) => {
  for (const scheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/?lang=en");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    for (const sel of ["#lang", "#mode", "a.app >> nth=0"]) expect((await page.locator(sel).boundingBox()).height, sel).toBeGreaterThanOrEqual(44);
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`), scheme).toEqual([]);
  }
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/?lang=en");
  await page.locator("#mode").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
