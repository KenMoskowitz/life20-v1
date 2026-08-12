import { cp, mkdir, rm } from "node:fs/promises";

const sourceFiles = [
  "index.html",
  "life20-website.html",
  "laura-composed.jpg",
  "laura-outdoor.jpg",
  "laura-joy.jpg",
  "assets/life20-home-hero.jpg",
  "assets/life20-home-founder.jpg",
  "assets/life20-next-level.jpg",
  "assets/life20-private-advisory.jpg",
  "blog",
  "next-level",
  "private-advisory",
  "application-received",
  "form-embed.html",
  "overflow-assessment",
  "Life2.0_9Variables_Guide.pdf",
];

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await mkdir("dist/assets", { recursive: true });
await cp("overflow-assessment/manus-storage", "dist/manus-storage", { recursive: true });

for (const sourceFile of sourceFiles) {
  await cp(sourceFile, `dist/${sourceFile}`, { recursive: true });
}
