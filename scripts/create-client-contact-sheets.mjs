import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "drive-download-20261105T084821Z-1-001");
const output = path.join(process.cwd(), "artifacts", "asset-audit");
const extensions = new Set([".jpg", ".jpeg", ".png", ".heic"]);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target];
    })
  );
  return files.flat();
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" };
    return entities[character];
  });
}

await fs.mkdir(output, { recursive: true });
const files = (await walk(root))
  .filter((file) => extensions.has(path.extname(file).toLowerCase()))
  .sort((a, b) => a.localeCompare(b));

const cells = [];
const failures = [];
for (const file of files) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  try {
    const image = await sharp(file)
      .rotate()
      .resize(300, 210, { fit: "contain", background: "#e9edf5" })
      .jpeg({ quality: 78 })
      .toBuffer();
    const label = Buffer.from(
      `<svg width="300" height="50"><rect width="300" height="50" fill="#111c52"/><text x="10" y="20" fill="white" font-size="12" font-family="Arial">${escapeXml(relative.slice(0, 44))}</text><text x="10" y="39" fill="#cbd7ee" font-size="11" font-family="Arial">${escapeXml(relative.slice(44, 88))}</text></svg>`
    );
    cells.push(
      await sharp({ create: { width: 300, height: 260, channels: 3, background: "#ffffff" } })
        .composite([
          { input: image, top: 0, left: 0 },
          { input: label, top: 210, left: 0 }
        ])
        .jpeg({ quality: 82 })
        .toBuffer()
    );
  } catch (error) {
    failures.push({
      file: relative,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

const columns = 4;
const rows = 4;
const perSheet = columns * rows;
for (let start = 0; start < cells.length; start += perSheet) {
  const page = cells.slice(start, start + perSheet);
  const composites = page.map((input, index) => ({
    input,
    left: (index % columns) * 310 + 10,
    top: Math.floor(index / columns) * 270 + 10
  }));
  await sharp({
    create: {
      width: columns * 310 + 10,
      height: rows * 270 + 10,
      channels: 3,
      background: "#f6f8fc"
    }
  })
    .composite(composites)
    .jpeg({ quality: 84 })
    .toFile(
      path.join(output, `contact-sheet-${String(start / perSheet + 1).padStart(2, "0")}.jpg`)
    );
}

await fs.writeFile(
  path.join(output, "audit.json"),
  JSON.stringify({ total: files.length, rendered: cells.length, failures }, null, 2)
);
console.log(JSON.stringify({ total: files.length, rendered: cells.length, failures }, null, 2));
