import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(
  root,
  "wasm/nightfolio-engine/target/wasm32-unknown-unknown/release/nightfolio_engine.wasm"
);
const destDir = join(root, "public/wasm");
const dest = join(destDir, "nightfolio-engine.wasm");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`copiado: ${src} -> ${dest}`);
