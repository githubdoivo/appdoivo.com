import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch (_) {} });
});

test("the molecule renders with no errors or missing files", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith("http://localhost")) errors.push(`${r.status()}: ${r.url()}`); });
  await page.goto("/?lang=en");
  await expect(page.locator("h1")).toHaveText("App do Ivo");
  await expect(page.locator(".atom:not(.ghost)")).toHaveCount(3);
  const broken = await page.$$eval("img", (ims) => ims.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
  expect(broken).toEqual([]);
  for (const f of ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "og-image.png"]) expect((await page.request.get(`/${f}`)).status(), f).toBe(200);
  expect(errors).toEqual([]);
});

test("the atoms show only their initials; Ai is the contact, Festa the demo, Astro the app", async ({ page }) => {
  await page.goto("/?lang=en");
  expect(await page.$$eval(".atom .sym", (s) => s.map((x) => x.textContent))).toEqual(["Ai", "Fe", "As"]);
  await expect(page.locator("#core")).toHaveAttribute("href", "mailto:mail@ivolopes.com");
  await expect(page.locator("#festa")).toHaveAttribute("href", "https://festa-demo.appdoivo.com");
  await expect(page.locator("#astro")).toHaveAttribute("href", "https://astro.appdoivo.com");
  // Each link has a name that says where it goes
  await expect(page.locator("#festa")).toHaveAccessibleName(/Festa.*Demo/);
  await expect(page.locator("#core")).toHaveAccessibleName(/mail@ivolopes\.com/);
});

test("on a mouse, the details appear on hover and on keyboard focus", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones show the details all the time");
  await page.goto("/?lang=en");
  const label = page.locator("#astro .label");
  await expect(label).toHaveCSS("opacity", "0");
  await page.locator("#astro .glass").hover({ force: true });
  await expect(label).toHaveCSS("opacity", "1");
  await page.mouse.move(5, 5);
  await page.locator("#festa").focus();
  await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab");
  await expect(page.locator("#festa .label")).toHaveCSS("opacity", "1");
});

test("on a phone, the details are always showing", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("/?lang=en");
  for (const id of ["core", "festa", "astro"]) await expect(page.locator(`#${id} .label`)).toHaveCSS("opacity", "1");
});

test("each bond runs from Ai's centre to its app's centre", async ({ page }) => {
  await page.goto("/?lang=en");
  await page.waitForTimeout(300);
  const gaps = await page.$$eval(".bond", (bs) => bs.map((b) => {
    const m = document.getElementById("molecule").getBoundingClientRect();
    const c = (el) => { const r = el.querySelector(".glass").getBoundingClientRect(); const box = el.getBoundingClientRect(); return [box.left + box.width / 2, box.top + box.height / 2]; };
    const [cx, cy] = c(document.getElementById("core")), [tx, ty] = c(document.getElementById(b.dataset.to));
    const len = parseFloat(b.style.width), ang = parseFloat(b.style.rotate);
    const ex = m.left + parseFloat(b.style.left) + Math.cos(ang) * len, ey = m.top + parseFloat(b.style.top) + Math.sin(ang) * len;
    return Math.hypot(ex - tx, ey - ty) + Math.hypot(m.left + parseFloat(b.style.left) - cx, m.top + parseFloat(b.style.top) - cy);
  }));
  for (const g of gaps) expect(g).toBeLessThan(10);
});

test("Portuguese: from the browser, and remembered after switching", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "pt-PT" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  await expect(page.locator("#festa")).toContainText("Experimentar a Demo");
  await expect(page.locator("#astro")).toContainText("Abrir");
  await page.locator("#lang").click();
  await expect(page.locator("#festa")).toContainText("Try the Demo");
  await page.reload();
  await expect(page.locator("#lang")).toHaveText("PT");
  await ctx.close();
});

test("everything stays on screen, labels never overlap, no sideways scroll", async ({ browser }) => {
  for (const [vp, touch] of [[{ width: 340, height: 640 }, true], [{ width: 390, height: 844 }, true], [{ width: 430, height: 932 }, true], [{ width: 768, height: 1024 }, true], [{ width: 1280, height: 720 }, false], [{ width: 1440, height: 900 }, false], [{ width: 1920, height: 1080 }, false]]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    for (const lang of ["en", "pt"]) {
      await page.goto(`/?lang=${lang}`);
      await page.addStyleTag({ content: ".label { opacity: 1 !important; } .molecule { animation: none !important; }" });
      await page.waitForTimeout(150);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${vp.width} ${lang}`).toBeLessThanOrEqual(0);
      const boxes = await page.$$eval(".atom:not(.ghost) .label, .atom:not(.ghost) .glass, #lang", (els) => els.map((e) => {
        const r = e.getBoundingClientRect(); const g = e.classList.contains("glass");
        // the ball itself, not its shadow
        const k = g ? 0.81 : 1, w = r.width * k;
        return { l: r.left + (g ? r.width * 0.085 : 0), t: r.top + (g ? r.height * 0.085 : 0), r: r.left + (g ? r.width * 0.085 : 0) + w, b: r.top + (g ? r.height * 0.085 : 0) + r.height * k, k: e.closest(".atom")?.id || e.id, label: e.classList.contains("label") };
      }));
      for (const b of boxes) expect(b.l >= -1 && b.r <= vp.width + 1 && b.t >= -1 && b.b <= vp.height + 1, `${b.k} ${b.label ? "label" : ""} at ${vp.width}x${vp.height} ${lang}`).toBe(true);
      for (const a of boxes.filter((b) => b.label)) for (const o of boxes) {
        if (a === o || a.k === o.k) continue;
        const hit = a.l < o.r - 2 && o.l < a.r - 2 && a.t < o.b - 2 && o.t < a.b - 2;
        expect(hit, `${a.k} label hits ${o.k} at ${vp.width}x${vp.height} ${lang}`).toBe(false);
      }
    }
    await ctx.close();
  }
});

test("touch targets are at least 44px", async ({ page }) => {
  await page.goto("/?lang=en");
  for (const sel of ["#lang", "#core", "#festa", "#astro"]) {
    const b = await page.locator(sel).boundingBox();
    expect(Math.min(b.width, b.height), sel).toBeGreaterThanOrEqual(44);
  }
});

test("English labels use Title Case", async ({ page }) => {
  await page.goto("/?lang=en");
  const small = new Set(["a", "an", "and", "the", "of", "by", "to", "for"]);
  for (const t of await page.$$eval(".what:not([data-t=core]), .go[data-t]", (els) => els.map((e) => e.textContent.replace("→", "").trim()))) {
    t.split(/\s+/).forEach((w, i) => { if (i === 0 || !small.has(w)) expect(w[0], t).toBe(w[0].toUpperCase()); });
  }
});

test("no serious accessibility problems", async ({ page }) => {
  await page.goto("/?lang=en");
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
});
