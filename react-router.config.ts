import type { Config } from "@react-router/dev/config";
import fs from "node:fs";
import path from "node:path";

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  async prerender() {
    const paths = ["/", "/articles", "/404"];
    
    // Scan content directory for all article slugs
    const contentDir = path.join(process.cwd(), "app", "content");
    if (fs.existsSync(contentDir)) {
      const files = fs.readdirSync(contentDir);
      files.forEach(file => {
        if (file.endsWith(".md")) {
          const slug = file.replace(/\.md$/, "");
          paths.push(`/articles/${slug}`);
        }
      });
    }
    
    return paths;
  },
} satisfies Config;
