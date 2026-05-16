/**
 * Stitch export: signed HTML + PNG to stitch-export/.
 * PowerShell:
 *   $env:STITCH_API_KEY = (Get-Content .cursor/mcp.json | ConvertFrom-Json).mcpServers.stitch.headers.'X-Goog-Api-Key'
 *   Optional: STITCH_SCREEN_ID, STITCH_OUT_SUBDIR (folder under CherryHouse-*)
 */
import { stitch } from "@google/stitch-sdk";
import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const PROJECT_ID = process.env.STITCH_PROJECT_ID ?? "5135456629211501200";
const SCREEN_ID =
  process.env.STITCH_SCREEN_ID ?? "cde75654e2df4845a2342d82390b6194";
const OUT_SUBDIR = process.env.STITCH_OUT_SUBDIR ?? "Trang-chu-Moi";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(
  ROOT,
  "..",
  "stitch-export",
  "CherryHouse-5135456629211501200",
  OUT_SUBDIR,
);

async function curlDownload(url, dest) {
  await execFileAsync("curl.exe", ["-Lf", url, "-o", dest], {
    windowsHide: true,
  });
}

if (!process.env.STITCH_API_KEY?.trim()) {
  console.error("Set STITCH_API_KEY (same value as X-Goog-Api-Key for Stitch MCP).");
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

const project = stitch.project(PROJECT_ID);
const screen = await project.getScreen(SCREEN_ID);

const htmlUrl = await screen.getHtml();
const imageUrl = await screen.getImage();

console.log("Download URLs resolved (temporary signed links).");
await curlDownload(htmlUrl, join(OUT_DIR, "screen.html"));
await curlDownload(imageUrl, join(OUT_DIR, "screen.png"));

console.log(`Wrote:\n  ${join(OUT_DIR, "screen.html")}\n  ${join(OUT_DIR, "screen.png")}`);
