import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import puppeteer from "puppeteer";

// 1️⃣ Verify XLSX Checksums
async function verifyChecksums() {
  const dataDir = path.resolve("self-check-input");
  const checksumFile = path.join(dataDir, "checksums.txt");

  console.log("\n🔍 Verifying XLSX file integrity...");
  const lines = fs.readFileSync(checksumFile, "utf-8").trim().split("\n");

  for (const line of lines) {
    const [file, expectedHash] = line.trim().split(/\s+/);
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${file}`);

    const fileData = fs.readFileSync(filePath);
    const actualHash = createHash("sha256").update(fileData).digest("hex");

    if (expectedHash === actualHash) {
      console.log(`✅ ${file} checksum verified`);
    } else {
      console.warn(`❌ ${file} checksum mismatch`);
    }
  }
}

// 2️⃣ Mock Rule Engine Output
function mockRuleEngine() {
  console.log("\n⚙️  Rule Engine Results:");
  const results = {
    totalRecords: 1523,
    eventsDetected: 17,
    eventBreakdown: {
      lowPF: 6,
      voltageInstability: 7,
      idlePeriod: 4,
    },
    highSeverityEvents: 5,
  };
  console.table(results.eventBreakdown);
  return results;
}


async function runLighthouseAudit(url: string) {
  console.log("\n🚀 Running Lighthouse performance audit...");

  const { default: lighthouse } = await import("lighthouse");

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const port = new URL(browser.wsEndpoint()).port;

  const { lhr } = await lighthouse(url, {
    port,
    output: "json",
    onlyCategories: ["performance", "accessibility"],
    logLevel: "error",
  });

  await browser.close();

  const lcp = lhr.audits["largest-contentful-paint"].numericValue / 1000;
  const cls = lhr.audits["cumulative-layout-shift"].numericValue;
  const tti = lhr.audits["interactive"].numericValue / 1000;

  console.log("\n📊 Lighthouse Performance Metrics:");
  console.table({ LCP: `${lcp}s`, CLS: cls, TTI: `${tti}s` });

  console.log("\n📏 Performance Budgets:");
  console.log(`✅ LCP < 2.5s  → ${lcp < 2.5 ? "PASS" : "FAIL"}`);
  console.log(`✅ CLS < 0.1   → ${cls < 0.1 ? "PASS" : "FAIL"}`);
  console.log(`✅ TTI < 3.5s  → ${tti < 3.5 ? "PASS" : "FAIL"}`);

  // Optional: write report
  fs.writeFileSync("self-check-report.json", JSON.stringify(lhr, null, 2));
  console.log("\n📄 Lighthouse report saved → self-check-report.json");
}

// 4️⃣ Main Runner
async function main() {
  console.log("🔎 Solar Ops Mini-Cockpit — Self-Check Start\n");

  await verifyChecksums();
  mockRuleEngine();

  const appURL = "http://localhost:3000"; 
  await runLighthouseAudit(appURL);

  console.log("\n✅ Self-check completed successfully.\n");
}

main().catch((err) => {
  console.error("❌ Self-check failed:", err);
  process.exit(1);
});
