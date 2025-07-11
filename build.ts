#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

// Simple build script to compile TypeScript to JavaScript using esbuild
import * as esbuild from "https://deno.land/x/esbuild@v0.20.0/mod.js";

async function buildProject() {
  console.log("🏎️ Building project...");
  
  try {
    // Use esbuild to bundle the application
    await esbuild.build({
      entryPoints: ['index.tsx'],
      bundle: true,
      outfile: 'index.js',
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      format: 'esm',
      platform: 'browser',
      sourcemap: true,
      minify: false,
      plugins: [{
        name: 'external-imports',
        setup(build) {
          // Handle importing from npm modules referenced in deno.json
          build.onResolve({ filter: /^preact(\/.*)?$/ }, args => {
            return { path: args.path, external: true };
          });
          
          // Handle .css imports
          build.onResolve({ filter: /\.css$/ }, args => {
            return { path: args.path, external: true };
          });
        }
      }]
    });
    
    console.log("✅ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build error:", error);
  } finally {
    // Clean up esbuild resources
    esbuild.stop();
  }
}

// Run the build
await buildProject();
