import { chromium } from "file:///C:/Users/HP/AppData/Local/npm-cache/_npx/420ff84f11983ee5/node_modules/playwright/index.mjs";
import { resolve } from "path";

const outDir = resolve("public/design-previews");

async function run() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Light (1440x900)
  {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    await page.goto("http://localhost:3005/design/command-center", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${outDir}/command-center-desktop-light.png`,
      fullPage: false,
    });
    console.log("Captured: command-center-desktop-light.png");
    await page.close();
  }

  // 2. Desktop Dark (1440x900)
  {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    await page.goto("http://localhost:3005/design/command-center?theme=dark", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${outDir}/command-center-desktop-dark.png`,
      fullPage: false,
    });
    console.log("Captured: command-center-desktop-dark.png");
    await page.close();
  }

  // 3. Mobile Light (390x844 - iPhone 14 style)
  {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await page.goto("http://localhost:3005/design/command-center", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${outDir}/command-center-mobile-light.png`,
      fullPage: false,
    });
    console.log("Captured: command-center-mobile-light.png");
    await page.close();
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
