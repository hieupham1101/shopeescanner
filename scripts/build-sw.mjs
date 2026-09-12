import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const paths = await readdir(".next/static", { recursive: true });
const assets = paths
  .filter((path) => /\.(js|css|woff2?)$/.test(path))
  .map((path) => "/_next/static/" + path.replaceAll("\\", "/"));
const version = createHash("sha256")
  .update(assets.join("\n"))
  .digest("hex")
  .slice(0, 12);
let template = await readFile("scripts/sw-template.txt", "utf8");
template = template
  .replace("pack-check-db-v1", "pack-check-db-" + version)
  .replace(
    "'/manifest.webmanifest']",
    "'/manifest.webmanifest'," +
      assets.map((asset) => JSON.stringify(asset)).join(",") +
      "]",
  );
await writeFile("public/sw.js", template);
console.log("Offline cache generated for " + assets.length + " assets.");
