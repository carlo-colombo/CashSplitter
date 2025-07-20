// Development server for Cashsplitter SPA
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const PORT = 8000;
const BUILD_DIR = "./build";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = BUILD_DIR + pathname;
  
  try {
    // Try to serve the exact file
    const file = await Deno.readFile(filePath);
    const contentType = getContentType(filePath);
    return new Response(file, { headers: { "content-type": contentType } });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

function getContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  
  switch (ext) {
    case "html": return "text/html";
    case "css": return "text/css";
    case "js": return "text/javascript";
    case "json": return "application/json";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "svg": return "image/svg+xml";
    default: return "application/octet-stream";
  }
}

console.log(`Cashsplitter development server running at http://localhost:${PORT}`);
console.log("Press Ctrl+C to stop");
await serve(handler, { port: PORT });
