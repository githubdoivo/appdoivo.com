import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.clear(); } catch (_) {} });
});

test("the molecule renders with no errors or missing files", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith("http://localhost")) errors.push(`${r.status()}: ${r.url()}`); });
  await page.goto("/?lang=en");
  await expect(page.locator("h1")).toContainText("App do Ivo");
  await expect(page.locator(".atom")).toHaveCount(3);
  for (const f of ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "og-image.png"]) {
    expect((await page.request.get(`/${f}`)).status(), f).toBe(200);
  }
  expect(errors).toEqual([]);
});

test("Festa opens its demo, and Astro is marked Soon with no link", async ({ page }) => {
  await page.goto("/?lang=en");
  await expect(page.locator("#festa")).toHaveAttribute("href", "https://festa-demo.appdoivo.com");
  await expect(page.locator("#festa")).toContainText("Try the Demo");
  await expect(page.locator("#astro")).toContainText("Soon");
  await expect(page.locator("#astro a, a#astro")).toHaveCount(0);
});

test("each bond runs from atom to atom", async ({ page }) => {
  await page.goto("/?lang=en");
  await page.waitForTimeout(300);
  const gaps = await page.$$eval(".bonds line", (lines) => lines.map((l) => {
    const svg = l.ownerSVGElement.getBoundingClientRect();
    const end = (cls) => { const r = document.querySelector(`.${cls} .ball`).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    const [x, y] = end(l.dataset.to);
    return Math.hypot(svg.left + (l.x2.baseVal.value / 100) * svg.width - x, svg.top + (l.y2.baseVal.value / 100) * svg.height - y);
  }));
  for (const g of gaps) expect(g).toBeLessThan(8);
});

test("Portuguese: from the browser, and remembered after switching", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "pt-PT" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  await expect(page.locator("#festa")).toContainText("Experimentar a demo");
  await expect(page.locator("#astro")).toContainText("Em breve");
  await page.locator("#lang").click();
  await expect(page.locator("#festa")).toContainText("Try the Demo");
  await page.reload();
  await expect(page.locator("#lang")).toHaveText("PT");
  await ctx.close();
});

test("everything stays on screen, labels never overlap, no sideways scroll", async ({ page }) => {
  for (const vp of [{ width: 340, height: 640 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 720 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(vp);
    for (const lang of ["en", "pt"]) {
      await page.goto(`/?lang=${lang}`);
      await page.waitForTimeout(150);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${vp.width} ${lang}`).toBeLessThanOrEqual(0);
      const boxes = await page.$$eval(".label, .ball, #lang", (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, k: e.closest(".atom")?.className || e.id, ball: e.classList.contains("ball") }; }));
      for (const b of boxes) expect(b.l >= 0 && b.r <= vp.width && b.t >= 0 && b.b <= vp.height, `${b.k} at ${vp.width}x${vp.height} ${lang}`).toBe(true);
      const labels = boxes.filter((b) => !b.ball && b.k !== "lang");
      for (const a of labels) for (const o of boxes) {
        if (a === o || a.k === o.k) continue;
        const overlap = a.l < o.r - 2 && o.l < a.r - 2 && a.t < o.b - 2 && o.t < a.b - 2;
        expect(overlap, `${a.k} label hits ${o.k} at ${vp.width}x${vp.height} ${lang}`).toBe(false);
      }
    }
  }
});

test("touch targets are at least 44px", async ({ page }) => {
  await page.goto("/?lang=en");
  for (const sel of ["#lang", "#festa", "footer a"]) {
    const b = await page.locator(sel).boundingBox();
    expect(Math.min(b.width, b.height), sel).toBeGreaterThanOrEqual(44);
  }
});

test("English labels use Title Case", async ({ page }) => {
  await page.goto("/?lang=en");
  const small = new Set(["a", "an", "and", "the", "of", "by", "to"]);
  for (const t of await page.$$eval(".what, .go", (els) => els.map((e) => e.textContent.replace("→", "").trim()))) {
    t.split(/\s+/).forEach((w, i) => { if (i === 0 || !small.has(w)) expect(w[0], t).toBe(w[0].toUpperCase()); });
  }
});

test("no serious accessibility problems", async ({ page }) => {
  await page.goto("/?lang=en");
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => v.id)).toEqual([]);
});
