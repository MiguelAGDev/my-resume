// ATS check for the resume PDF.
// Usage: node check.mjs [path/to/resume.pdf] [--jd path/to/job-description.txt] [--text]
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { analyzeResume, defaultProfiles } from "@pranavraut033/ats-checker";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const pdfPath = resolve(
  args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--jd") ??
    resolve(here, "..", "Miguel Avila - Resume.pdf"),
);
const jdPath = resolve(opt("--jd") ?? resolve(here, "jd", "software-engineer.txt"));

const parser = new PDFParse({ data: new Uint8Array(await readFile(pdfPath)) });
const { text, total } = await parser.getText();
await parser.destroy();
const jobDescription = await readFile(jdPath, "utf8");

const profile = defaultProfiles.find((p) => p.name === "software-engineer");
const result = analyzeResume({
  resumeText: text,
  jobDescription,
  config: { profile: { ...profile, minExperience: 0 } }, // internship: no minimum years
});

const line = (label, value) => console.log(`${label.padEnd(24)} ${value}`);
const list = (items) => (items?.length ? items.join(", ") : "-");

console.log(`\nResume : ${pdfPath}`);
console.log(`JD     : ${jdPath}`);
console.log(`Pages  : ${total}\n`);
if (flag("--text")) console.log("---- extracted text ----\n" + text + "\n------------------------\n");

line("ATS SCORE", `${result.score} / 100`);
for (const [k, v] of Object.entries(result.breakdown)) line(`  ${k}`, Math.round(v));
console.log();
line("Sections detected", list(result.detectedSections));
line("Experience (years)", result.parsedExperienceYears);
line("Achievement bullets", `${result.achievementStrength.strong} strong / ${result.achievementStrength.weak} weak`);
line("Matched skills", list(result.matchedSkills));
line("Missing skills", list(result.missingSkills));
line("Missing keywords", list(result.missingKeywords));
line("Overused keywords", list(result.overusedKeywords));
console.log("\nParseability deductions:");
const ded = result.parseabilityReport?.deductions ?? result.parseabilityReport?.items ?? [];
console.log(ded.length ? ded.map((d) => `  -${d.points}  ${d.reason}`).join("\n") : "  none");
console.log("\nWarnings:");
console.log(result.warnings.length ? result.warnings.map((w) => `  - ${w}`).join("\n") : "  none");
console.log("\nSuggestions:");
console.log(result.suggestions.length ? result.suggestions.map((s) => `  - ${s}`).join("\n") : "  none");
console.log();
