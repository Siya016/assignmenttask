import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const dataDir = path.resolve("self-check-input");
const outputFile = path.join(dataDir, "checksums.txt");

async function generateChecksums() {
  const files = await fs.readdir(dataDir);
  const xlsxFiles = files.filter((f) => f.endsWith(".xlsx"));

  const lines: string[] = [];

  for (const file of xlsxFiles) {
    const filePath = path.join(dataDir, file);
    const data = await fs.readFile(filePath);
    const hash = createHash("sha256").update(data).digest("hex");
    lines.push(`${file} ${hash}`);
  }

  await fs.writeFile(outputFile, lines.join("\n"));
  console.log("✅ checksums.txt generated successfully:\n");
  console.log(lines.join("\n"));
}

generateChecksums().catch((err) => {
  console.error("❌ Error generating checksums:", err);
  process.exit(1);
});
