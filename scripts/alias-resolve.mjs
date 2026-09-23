import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = path.resolve(import.meta.dirname, "../src");

function withExtension(base) {
  for (const ext of [".ts", ".tsx", "/index.ts"]) {
    if (existsSync(base + ext)) return base + ext;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const file = withExtension(path.join(SRC, specifier.slice(2)));
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    const base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    if (!existsSync(base) || !path.extname(base)) {
      const file = withExtension(base);
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
  }
  return next(specifier, context);
}
