import type { Config } from "@react-router/dev/config";
import fs from "node:fs";
import path from "node:path";

export default {
  // 关键：设置为 false 启用纯 SPA 模式，避免静态部署时的 JSON 数据请求问题
  ssr: false,
  // 依然保留预渲染，确保 SEO 和首屏速度
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

    // Scan content/img directory for all images to prerender them
    const imgDir = path.join(process.cwd(), "app", "content", "img");
    if (fs.existsSync(imgDir)) {
      const scanImages = (dir: string, base: string = "") => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const relativePath = path.join(base, item);
          if (fs.statSync(fullPath).isDirectory()) {
            scanImages(fullPath, relativePath);
          } else {
            paths.push(`/content-img/${relativePath.replace(/\\/g, '/')}`);
          }
        });
      };
      scanImages(imgDir);
    }
    
    return paths;
  },
} satisfies Config;
