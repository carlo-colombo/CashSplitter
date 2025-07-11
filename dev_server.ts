import { serve } from "https://deno.land/std@0.214.0/http/server.ts";

// Simple HTTP server for development
async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);
  const filePath = pathname === "/" ? "/index.html" : pathname;
  
  try {
    // Try to read the requested file from the local file system
    const file = await Deno.readFile(`.${filePath}`);
    
    // Set content type based on file extension
    const contentType = getContentType(filePath);
    
    return new Response(file, {
      headers: { "content-type": contentType },
    });
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return new Response("Not found", { status: 404 });
    }
    
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(`Internal server error: ${errorMessage}`, { status: 500 });
  }
}

// Map file extensions to content types
function getContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  
  switch (ext) {
    case "html": return "text/html";
    case "css": return "text/css";
    case "js": return "application/javascript";
    case "json": return "application/json";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "svg": return "image/svg+xml";
    default: return "text/plain";
  }
}

const PORT = 3000;
console.log(`Development server running on http://localhost:${PORT}`);
serve(handleRequest, { port: PORT });
