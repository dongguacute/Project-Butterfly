import React from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

import type { Route } from "./+types/root";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { SearchModal } from "./components/search-modal";
import { NotFound } from "./components/not-found";
import "./app.css";

export async function loader() {
  const contentDir = path.join(process.cwd(), "app", "content");
  if (!fs.existsSync(contentDir)) {
    return { searchIndex: [] };
  }

  const filenames = fs.readdirSync(contentDir);
  const searchIndex = filenames
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(contentDir, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      return {
        id: filename.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        content: content, // Keep full content for client-side search
        category: data.category || "未分类",
        description: data.description || "",
      };
    });

  return { searchIndex };
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>() || { searchIndex: [] };
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <div 
          id="main-layout" 
          className="transition-[filter] duration-500"
          style={{ filter: isSearchOpen ? "blur(12px)" : "none" }}
        >
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] transition-colors duration-1000" />
            <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-purple-500/20 dark:bg-purple-500/10 blur-[120px] transition-colors duration-1000" />
            <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-pink-500/20 dark:bg-pink-500/10 blur-[120px] transition-colors duration-1000" />
          </div>
          <Navbar 
            setIsSearchOpen={setIsSearchOpen}
          />
          {children}
          <Footer />
        </div>
        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          searchIndex={data.searchIndex}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "抱歉，您访问的页面似乎飞走了。"
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-purple-500/20 dark:bg-purple-500/10 blur-[120px]" />
      </div>
      
      <main className="flex-grow flex items-center justify-center">
        {message === "404" ? (
          <NotFound message={message} details={details} />
        ) : (
          <div className="p-8 max-w-2xl w-full bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{message}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{details}</p>
            {stack && (
              <pre className="w-full p-4 overflow-x-auto bg-black/5 dark:bg-black/20 rounded-xl text-sm font-mono text-gray-700 dark:text-gray-300">
                <code>{stack}</code>
              </pre>
            )}
            <div className="mt-8">
              <Link
                to="/"
                className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                回到首页
              </Link>
            </div>
          </div>
        )}
      </main>
      
      <ScrollRestoration />
      <Scripts />
    </div>
  );
}
