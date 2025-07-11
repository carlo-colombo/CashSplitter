#!/usr/bin/env deno run --allow-read --allow-write --allow-run

/**
 * This script verifies and sets up the Cashsplitter app for proper offline functionality
 */

// Import required Deno modules
import { ensureDir, exists } from "https://deno.land/std@0.220.1/fs/mod.ts";
import { join } from "https://deno.land/std@0.220.1/path/mod.ts";

// Define constants
const PROJECT_ROOT = new URL(".", import.meta.url).pathname;
const ASSETS_DIR = join(PROJECT_ROOT, "assets");
const REQUIRED_FILES = [
  "service-worker.js",
  "manifest.json",
  "offline.html",
  "assets/icon-192.png",
  "assets/icon-512.png"
];

// Main function
async function setupOfflineApp() {
  console.log("🏎️ Setting up Cashsplitter for offline use...");
  
  // Ensure assets directory exists
  await ensureDir(ASSETS_DIR);
  
  // Check for all required files
  const missingFiles = [];
  for (const file of REQUIRED_FILES) {
    const filePath = join(PROJECT_ROOT, file);
    if (!await exists(filePath)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error("❌ Missing required files for offline functionality:");
    missingFiles.forEach(file => console.error(`   - ${file}`));
    console.error("Please make sure to create all required files.");
    Deno.exit(1);
  }
  
  console.log("✅ All required offline app files are present.");
  
  // Verify service worker registration in index.html
  const indexPath = join(PROJECT_ROOT, "index.html");
  const indexContent = await Deno.readTextFile(indexPath);
  
  if (!indexContent.includes("serviceWorker.register")) {
    console.error("❌ Service worker registration not found in index.html");
    Deno.exit(1);
  }
  
  console.log("✅ Service worker registration is set up in index.html");
  console.log("✅ Cashsplitter is ready for offline use!");
}

// Run the setup
await setupOfflineApp();
