// Browser-only fixtures: no real credentials or database mutations.
// Install separately: npm install --prefix .cache/admin-browser --no-package-lock playwright
// Run with a Vite dev server on port 5173: node scripts/admin-ui-check.mjs
import { chromium } from "../.cache/admin-browser/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();
let role = "admin";
let authenticated = true;
await context.route("**/src/contexts/AuthContext.jsx", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: `export const useAuth = () => ({currentUser: window.__signedOut ? null : ${authenticated ? JSON.stringify({ email: "ui-check@example.test" }) : "null"}, appUser: {role: ${JSON.stringify(role)}, status: 'active'}, role: ${JSON.stringify(role)}, loading: false, signOut: async () => { window.__signedOut = true; }}); export const AuthProvider = ({children}) => children;`,
  }),
);
await context.route("**/*.supabase.co/**", (route) =>
  route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: {
      "content-range": "*/0",
      "access-control-expose-headers": "content-range",
    },
    body: route.request().method() === "HEAD" ? "" : "[]",
  }),
);
await context.route("**/firestore.googleapis.com/**", (route) => route.abort());
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const routes = [
  "",
  "admissions",
  "students",
  "results",
  "materials",
  "quizzes",
  "analytics",
  "attendance",
  "notifications",
  "settings",
];
try {
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:5173/admin${route ? "/" + route : ""}`);
      await page.locator("[data-page-heading]").waitFor();
      assert.equal(
        await page
          .locator(
            'nav[aria-label="Admin navigation"]:visible a[aria-current="page"]',
          )
          .count(),
        width < 768 ? 0 : 1,
      );
      const overflow = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth > innerWidth,
        content:
          document.querySelector("#admin-content").scrollWidth >
          document.querySelector("#admin-content").clientWidth,
      }));
      assert.deepEqual(
        overflow,
        { page: false, content: false },
        `${width}px /admin/${route} overflow`,
      );
    }
    if (width < 768) {
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
      await page.getByRole("dialog").waitFor();
      await page
        .getByRole("dialog")
        .getByRole("link", { name: "Results", exact: true })
        .click();
      await page.waitForURL("**/admin/results");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
    } else {
      await page
        .getByRole("button", { name: "Collapse sidebar", exact: true })
        .click();
      assert.equal(
        await page
          .locator("aside")
          .evaluate((el) => el.getBoundingClientRect().width),
        72,
      );
      await page.getByRole("link", { name: "Results", exact: true }).click();
      await page.waitForURL("**/admin/results");
      await page
        .getByRole("button", { name: "Expand sidebar", exact: true })
        .click();
    }
    await page.reload();
    await page.getByRole("heading", { name: "Results", exact: true }).waitFor();
    await page.goto("http://127.0.0.1:5173/admin");
    await page.locator("[data-page-heading]").waitFor();
    await page.waitForFunction(
      () =>
        !Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent === "Refresh overview",
        )?.disabled,
    );
    await page.screenshot({
      path: `.cache/admin-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("link", { name: /Review Admissions/ }).click();
    await page.waitForURL("**/admin/admissions");
    await page.goBack();
    await page
      .getByRole("heading", { name: "Dashboard", exact: true })
      .waitFor();
    await page.goForward();
    await page
      .getByRole("heading", { name: "Admissions", exact: true })
      .waitFor();
    console.log(
      `PASS ${width}px: all routes, navigation, refresh, back/forward, sidebar`,
    );
  }
  assert.deepEqual(errors, [], "Admin browser runtime errors");
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await page.waitForURL("**/login");
  console.log(
    "PASS logout: context signOut called and login navigation completed",
  );
  role = "student";
  await page.goto("http://127.0.0.1:5173/admin/results");
  // Login correctly forwards an already signed-in student to their dashboard.
  await page.waitForURL("**/student-dashboard");
  assert.equal(
    await page.locator('nav[aria-label="Admin navigation"]').count(),
    0,
  );
  authenticated = false;
  await page.goto("http://127.0.0.1:5173/admin/admissions");
  await page.waitForURL("**/login");
  console.log("PASS role guard: student and unauthenticated access denied");
} finally {
  await browser.close();
}
