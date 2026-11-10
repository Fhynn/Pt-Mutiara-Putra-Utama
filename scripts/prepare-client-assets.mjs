import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const workspace = process.cwd();
const sourceRoot = path.join(workspace, "drive-download-20261105T084821Z-1-001");
const outputRoot = path.join(workspace, "public", "client");

const assets = [
  {
    source: ["PT CABANG SRAGEN", "IMG_1537.PNG"],
    output: "hero-training.webp",
    width: 1600,
    height: 1050,
    position: "attention"
  },
  {
    source: ["PT CABANG SRAGEN", "IMG_1532.PNG"],
    output: "about-office.webp",
    width: 1400,
    height: 900,
    position: "centre"
  },
  {
    source: ["PT PUSAT", "IMG_1526.JPG"],
    output: "training-class.webp",
    width: 1400,
    height: 900,
    position: "attention"
  },
  {
    source: ["PT PUSAT", "IMG_1534.JPG"],
    output: "gallery-team.webp",
    width: 1200,
    height: 900,
    position: "attention"
  },
  {
    source: ["PT CABANG SRAGEN", "IMG_1531.PNG"],
    output: "gallery-office-sragen.webp",
    width: 1200,
    height: 900,
    position: "centre"
  },
  {
    source: ["PT CABANG SRAGEN", "IMG_1538.PNG"],
    output: "gallery-training-sragen.webp",
    width: 1200,
    height: 900,
    position: "attention"
  },
  {
    source: ["PT CABANG SRAGEN", "IMG_1540.PNG"],
    output: "gallery-briefing.webp",
    width: 1200,
    height: 900,
    position: "attention"
  },
  {
    source: ["PT CABANG LEGOK", "IMG_1542.PNG"],
    output: "gallery-training-legok.webp",
    width: 1200,
    height: 900,
    position: "attention"
  },
  {
    source: ["AGENCY KERJA SAMA", "70c66d29-16b5-4eaa-872f-ed2436ac0020.jpg"],
    output: "gallery-partner.webp",
    width: 1200,
    height: 900,
    position: "attention"
  }
];

await fs.mkdir(outputRoot, { recursive: true });

for (const asset of assets) {
  const source = path.join(sourceRoot, ...asset.source);
  const output = path.join(outputRoot, asset.output);
  await sharp(source)
    .rotate()
    .resize(asset.width, asset.height, { fit: "cover", position: asset.position })
    .webp({ quality: 84, effort: 5 })
    .toFile(output);
  console.log(`${path.relative(workspace, source)} -> ${path.relative(workspace, output)}`);
}
