// Build script for the Cashsplitter SPA
import {
  copy,
  emptyDir,
  ensureDir,
} from "https://deno.land/std@0.200.0/fs/mod.ts";

const BUILD_DIR = "./build";
const STATIC_DIR = "./static";
const ENTRY_POINT = "./src/index.tsx";
const OUTPUT_BUNDLE = `${BUILD_DIR}/index.js`;

async function build() {
  console.log("Building Cashsplitter...");

  // Clean or create build directory
  await emptyDir(BUILD_DIR);
  await ensureDir(BUILD_DIR);

  // Copy static files
  console.log("Copying static files...");
  await copy(STATIC_DIR, BUILD_DIR, { overwrite: true });

  // Bundle the application
  console.log("Bundling TypeScript/JSX files...");
  const command = new Deno.Command("deno", {
    args: [
      "bundle",
      "--platform=browser",
      ENTRY_POINT,
      "--output",
      OUTPUT_BUNDLE,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stderr } = await command.output();

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
  await build();
}
