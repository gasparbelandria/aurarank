import { existsSync } from "fs";

const LOCAL_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

// Launched once per cold start and reused across requests in the same instance.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedBrowser: any = null;

async function getOrLaunchBrowser(width: number, height: number) {
  const puppeteer = (await import("puppeteer-core")).default;

  // Return cached browser if still connected
  if (cachedBrowser?.isConnected?.()) return cachedBrowser;

  const isServerless = !!(process.env.VERCEL || process.env.AWS_EXECUTION_ENV || process.env.LAMBDA_TASK_ROOT);

  if (isServerless) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const executablePath = await chromium.executablePath(
      process.env.CHROMIUM_REMOTE_EXEC_PATH ??
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar"
    );
    cachedBrowser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width, height },
      executablePath,
      headless: true,
    });
  } else {
    // Local dev: use system Chrome / env override
    const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const executablePath = envPath && existsSync(envPath)
      ? envPath
      : LOCAL_CHROME_PATHS.find(p => existsSync(p));

    if (!executablePath) {
      throw new Error(
        "Chrome not found. Install Chrome or set PUPPETEER_EXECUTABLE_PATH."
      );
    }

    cachedBrowser = await puppeteer.launch({
      executablePath,
      defaultViewport: { width, height },
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }

  // Clear cache if browser crashes
  cachedBrowser.on("disconnected", () => { cachedBrowser = null; });
  return cachedBrowser;
}

export async function captureYoutubeFrame(
  videoId: string,
  startSec: number,
  aspectRatio: "9:16" | "16:9"
): Promise<Buffer | null> {
  const isShort = aspectRatio === "9:16";
  const width = isShort ? 360 : 640;
  const height = isShort ? 640 : 360;

  let page = null;
  try {
    const browser = await getOrLaunchBrowser(width, height);
    page = await browser.newPage();
    await page.setViewport({ width, height });

    // youtube-nocookie.com avoids consent dialogs in headless Chrome
    const url = [
      `https://www.youtube-nocookie.com/embed/${videoId}`,
      `?autoplay=1&mute=1&start=${startSec}&controls=0&playsinline=1`,
      `&modestbranding=1&rel=0&iv_load_policy=3`,
    ].join("");

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8_000 });

    // Give the player time to seek to startSec and render the frame
    await new Promise(r => setTimeout(r, 3_000));

    const screenshot = await page.screenshot({ type: "jpeg", quality: 85 });
    return Buffer.from(screenshot);
  } catch (err) {
    console.error("[captureYoutubeFrame]", err);
    return null;
  } finally {
    // Close the page but keep the browser alive for reuse
    if (page) await page.close().catch(() => {});
  }
}
