import { useLoaderData, Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import gfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { h } from "hastscript";
import parse from "html-react-parser";
import gsap from "gsap";
import type { LoaderFunctionArgs } from "react-router";

// Add highlight.js theme
import "highlight.js/styles/github-dark.css";

// Custom plugin to handle :::note style directives
function remarkDirectiveTransformer() {
  return (tree: any) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {});
        const tagName = node.type === 'textDirective' ? 'span' : 'div';

        data.hName = tagName;
        data.hProperties = {
          ...(data.hProperties || {}),
          className: [node.name],
        };
      }
    });
  };
}

// Custom plugin to transform CSV code blocks into HTML tables
function rehypeCsvToTable() {
  return (tree: any) => {
    visit(tree, 'element', (node, index, parent) => {
      if (
        node.tagName === 'pre' &&
        node.children.length === 1 &&
        node.children[0].tagName === 'code' &&
        node.children[0].properties?.className?.includes('language-csv')
      ) {
        const csvContent = node.children[0].children[0].value;
        const rows = csvContent.trim().split('\n').map((row: string) => 
          row.split(',').map((cell: string) => cell.trim())
        );

        if (rows.length === 0) return;

        const table = h('div', { className: 'csv-table-wrapper' }, [
          h('table', { className: 'csv-table' }, [
            h('thead', [
              h('tr', rows[0].map((cell: string) => h('th', cell)))
            ]),
            h('tbody', rows.slice(1).map((row: string[]) => 
              h('tr', row.map((cell: string) => h('td', cell)))
            ))
          ])
        ]);

        if (parent && typeof index === 'number') {
          parent.children[index] = table;
        }
      }
    });
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), "app", "content", `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Response("Not Found", { status: 404 });
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  // Remove the first H1 if it matches the title or is just an H1 at the start
  const cleanContent = content.replace(/^#\s+.+\n?/, "").trim();

  const processedContent = await remark()
    .use(gfm)
    .use(remarkDirective)
    .use(remarkDirectiveTransformer)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeCsvToTable)
    .use(rehypeHighlight, { 
      detect: true,
      ignoreMissing: true,
      aliases: { 'csv': 'plaintext' }
    })
    .use(rehypeStringify)
    .process(cleanContent);
  
  const contentHtml = processedContent.toString();

  return {
    title: data.title || "Untitled",
    date: data.date || "",
    category: data.category || "未分类",
    description: data.description || "",
    contentHtml,
  };
}

export default function ArticleDetail() {
  const { title, date, category, contentHtml, description } = useLoaderData<typeof loader>();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const headerRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
      
      // Show button after scrolling 400px
      setShowBackToTop(winScroll > 400);
    };

    window.addEventListener("scroll", handleScroll);
    
    // Initial animation
    gsap.fromTo(headerRef.current, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
    
    gsap.fromTo(articleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
    );

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animate button visibility
  useEffect(() => {
    if (showBackToTop) {
      gsap.to(backToTopRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        display: "flex"
      });
    } else {
      gsap.to(backToTopRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          if (backToTopRef.current) backToTopRef.current.style.display = "none";
        }
      });
    }
  }, [showBackToTop]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-gray-100 dark:bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Back to Top Button */}
        <button
          ref={backToTopRef}
          onClick={scrollToTop}
          className="fixed bottom-12 right-12 z-[70] hidden items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 dark:border-white/10 hover:scale-110 active:scale-95 transition-transform group"
          aria-label="Back to top"
          style={{ opacity: 0, transform: "translateY(20px) scale(0.8)" }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
          <svg 
            className="w-6 h-6 relative z-10 group-hover:-translate-y-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-12">
          <Link 
            to="/articles"
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span>返回列表</span>
          </Link>
          
          <div className="flex gap-4">
            {/* Social Share Placeholder */}
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Article Header */}
        <header ref={headerRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            {category}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight leading-[1.1]">
            {title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {description.length > 0 ? `${Math.ceil(contentHtml.length / 500)} 分钟阅读` : "5 分钟阅读"}
            </div>
          </div>
        </header>

        {/* Article Content Card */}
        <article 
          ref={articleRef}
          className="relative group"
        >
          {/* Decorative side line */}
          <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-white/10 to-transparent hidden xl:block" />
          
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 sm:p-12 md:p-16 shadow-2xl shadow-indigo-500/5">
            {/* Introduction / Summary */}
            {description && (
              <div className="mb-12 pb-12 border-b border-gray-100 dark:border-white/5">
                <p className="text-xl text-gray-600 dark:text-gray-300 italic leading-relaxed font-medium">
                  "{description}"
                </p>
              </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none 
              prose-headings:font-black prose-headings:tracking-tight 
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6
              prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:mb-8
              prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline decoration-2 underline-offset-4
              prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-500/5 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-200
              prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:mx-auto
              prose-code:text-indigo-600 dark:prose-code:text-indigo-300 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-950 dark:prose-pre:bg-black prose-pre:rounded-2xl prose-pre:shadow-2xl prose-pre:border prose-pre:border-white/10
              prose-ul:list-disc prose-ul:pl-6 prose-li:mb-2
              selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100"
            >
              {parse(contentHtml)}
            </div>
          </div>
        </article>

        {/* Article Copyright & Meta Card */}
        <section className="mt-12 bg-gray-50/50 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 p-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.15-5.36c-.46.36-1.01.54-1.65.54-1.07 0-1.92-.36-2.54-1.07-.62-.71-.93-1.68-.93-2.91 0-1.23.31-2.2.93-2.91.62-.71 1.47-1.07 2.54-1.07.64 0 1.19.18 1.65.54.46.36.78.87.96 1.53h-1.04c-.16-.38-.4-.68-.72-.9-.32-.22-.7-.33-1.15-.33-.74 0-1.31.25-1.72.75-.41.5-.62 1.25-.62 2.25s.2 1.75.61 2.25c.41.5.98.75 1.73.75.45 0 .83-.11 1.15-.33.32-.22.56-.52.72-.9h1.04c-.18.66-.5 1.17-.96 1.53zm5.3 0c-.46.36-1.01.54-1.65.54-1.07 0-1.92-.36-2.54-1.07-.62-.71-.93-1.68-.93-2.91 0-1.23.31-2.2.93-2.91.62-.71 1.47-1.07 2.54-1.07.64 0 1.19.18 1.65.54.46.36.78.87.96 1.53h-1.04c-.16-.38-.4-.68-.72-.9-.32-.22-.7-.33-1.15-.33-.74 0-1.31.25-1.72.75-.41.5-.62 1.25-.62 2.25s.2 1.75.61 2.25c.41.5.98.75 1.73.75.45 0 .83-.11 1.15-.33.32-.22.56-.52.72-.9h1.04c-.18.66-.5 1.17-.96 1.53z" />
            </svg>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">发布时间</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">本文链接</h4>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm break-all font-mono">
                  {currentUrl}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">版权声明</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  本文章采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">CC BY-NC-SA 4.0</a> 许可协议。转载请注明来自 <span className="font-bold text-gray-900 dark:text-white">Project Butterfly</span>。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Actions */}
        <footer className="mt-20 pt-16 border-t border-gray-100 dark:border-white/5 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">喜欢这篇文章吗？</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
              记录是为了更好的出发。感谢你的阅读，希望能给你带来一点点启发或共鸣。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/articles"
                className="px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-105 transition-all active:scale-95 shadow-xl shadow-gray-900/10 dark:shadow-none flex items-center gap-2"
              >
                探索更多故事
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
