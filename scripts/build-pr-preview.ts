// Build script for pull request previews of the Cashsplitter SPA
import {
  copy,
  emptyDir,
  ensureDir,
} from "https://deno.land/std@0.200.0/fs/mod.ts";
import { parse } from "https://deno.land/std@0.200.0/flags/mod.ts";

const BUILD_DIR = "./build";
const STATIC_DIR = "./static";
const ENTRY_POINT = "./src/index.tsx";
const OUTPUT_BUNDLE = `${BUILD_DIR}/index.js`;

async function build(basePath: string) {
  console.log("Building Cashsplitter PR Preview...");

  // Clean or create build directory
  await emptyDir(BUILD_DIR);
  await ensureDir(BUILD_DIR);

  // Copy static files, modifying index.html
  console.log("Copying static files and modifying index.html...");
  for await (const dirEntry of Deno.readDir(STATIC_DIR)) {
    const srcPath = `${STATIC_DIR}/${dirEntry.name}`;
    const destPath = `${BUILD_DIR}/${dirEntry.name}`;
    if (dirEntry.name === "index.html") {
      let html = await Deno.readTextFile(srcPath);
      html = html.replace(
        "<head>",
        `<head>\n    <base href="${basePath}">`,
      );
      await Deno.writeTextFile(destPath, html);
    } else {
      await copy(srcPath, destPath, { overwrite: true });
    }
  }

  // Bundle the application
  console.log("Bundling TypeScript/JSX files...");
  const { code, stderr } = await new Deno.Command("deno", {
    args: [
      "bundle",
      "--platform=browser",
      ENTRY_POINT,
      "--output",
      OUTPUT_BUNDLE,
    ],
  }).output();

  if (code === 0) {
    console.log("Bundle created successfully at", OUTPUT_BUNDLE);
  } else {
    const errorString = new TextDecoder().decode(stderr);
    console.error("Bundle creation failed:");
    console.error(errorString);
    Deno.exit(1);
  }

  console.log("Build completed");
}

if (import.meta.main) {
  const flags = parse(Deno.args, {
    string: ["pr-number"],
  });

  const prNumber = flags["pr-number"];
  if (!prNumber) {
    console.error("Error: --pr-number flag is required.");
    Deno.exit(1);
  }

  const basePath = `/cashsplitter/pr-preview/pr-${prNumber}/`;
  await build(basePath);
}
