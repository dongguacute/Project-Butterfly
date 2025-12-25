import { type LoaderFunctionArgs } from "react-router";
import fs from "node:fs";
import path from "node:path";

export async function loader({ params }: LoaderFunctionArgs) {
  const imagePath = params["*"];
  if (!imagePath) {
    throw new Response("Not Found", { status: 404 });
  }

  // Security: Prevent directory traversal
  const sanitizedPath = path.normalize(imagePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(process.cwd(), "app", "content", "img", sanitizedPath);

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Response("Not Found", { status: 404 });
  }

  const file = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  const contentType: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
  };

  return new Response(file, {
    headers: {
      "Content-Type": contentType[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
