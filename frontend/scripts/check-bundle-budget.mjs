import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";

const projectRoot = path.resolve(import.meta.dirname, "..");
const assetsDirectory = path.join(projectRoot, "dist", "assets");
const limits = {
  largestJavaScriptGzip: 190 * 1024,
  totalJavaScriptGzip: 500 * 1024,
};

const names = await readdir(assetsDirectory);
const javascriptFiles = names.filter((name) => name.endsWith(".js"));
const sizes = await Promise.all(javascriptFiles.map(async (name) => {
  const filePath = path.join(assetsDirectory, name);
  const [contents, metadata] = await Promise.all([readFile(filePath), stat(filePath)]);
  return { name, raw: metadata.size, gzip: gzipSync(contents).length };
}));
const largest = sizes.reduce((current, item) => item.gzip > current.gzip ? item : current, { name: "aucun", raw: 0, gzip: 0 });
const totalGzip = sizes.reduce((total, item) => total + item.gzip, 0);

process.stdout.write(`JavaScript: ${javascriptFiles.length} chunks, ${(totalGzip / 1024).toFixed(1)} Kio gzip au total.\n`);
process.stdout.write(`Plus gros chunk: ${largest.name}, ${(largest.gzip / 1024).toFixed(1)} Kio gzip.\n`);

const failures = [];
if (largest.gzip > limits.largestJavaScriptGzip) failures.push(`plus gros chunk > ${limits.largestJavaScriptGzip / 1024} Kio gzip`);
if (totalGzip > limits.totalJavaScriptGzip) failures.push(`total JavaScript > ${limits.totalJavaScriptGzip / 1024} Kio gzip`);

if (failures.length > 0) {
  process.stderr.write(`Budget dépassé: ${failures.join(", ")}.\n`);
  process.exitCode = 1;
}
