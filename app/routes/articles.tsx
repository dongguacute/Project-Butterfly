import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface ArticleMeta {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
}

function calculateReadTime(content: string) {
  const wordsPerMinute = 200;
  const chineseCharsPerMinute = 300;

  // Remove frontmatter
  const cleanContent = content.replace(/^---[\s\S]*?---/, "");

  // Count Chinese characters
  const chineseChars = (cleanContent.match(/[\u4e00-\u9fa5]/g) || []).length;
  
  // Count English words
  const englishWords = cleanContent
    .replace(/[\u4e00-\u9fa5]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  const readTimeMinutes = Math.ceil(
    chineseChars / chineseCharsPerMinute + englishWords / wordsPerMinute
  );

  return `${readTimeMinutes} min read`;
}

export async function loader() {
  const contentDir = path.join(process.cwd(), "app", "content");
  const filenames = fs.readdirSync(contentDir);

  const articles = filenames
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(contentDir, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      
      return {
        id: filename.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        description: data.description || "",
        date: data.date || "",
        category: data.category || "未分类",
        readTime: calculateReadTime(content),
      } as ArticleMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get all unique categories
  const categories = Array.from(new Set(articles.map(a => a.category)));

  return { articles, categories };
}

export default function ArticlesPage() {
  const { articles, categories } = useLoaderData<typeof loader>();
  const [activeCategory, setActiveCategory] = useState<string>("全部");

  const filteredArticles = activeCategory === "全部" 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">文章列表</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            记录每一次思考，见证每一次蜕变。
          </p>
        </header>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => setActiveCategory("全部")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === "全部"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md"
                : "bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10"
            }`}
          >
            全部
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md"
                  : "bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-8">
          {filteredArticles.map((article) => (
            <Link 
              key={article.id}
              to={`/articles/${article.id}`}
              className="group relative block p-8 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full w-fit">
                  {article.category}
                </span>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{article.date}</span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <span>{article.readTime}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {article.title}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {article.description}
              </p>

              {/* Arrow decoration */}
              <div className="mt-6 flex items-center text-sm font-semibold text-gray-900 dark:text-white group-hover:gap-2 transition-all">
                阅读更多
                <svg 
                  className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
