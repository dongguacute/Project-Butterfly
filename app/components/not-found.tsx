import { Link } from "react-router";

interface NotFoundProps {
  message?: string;
  details?: string;
}

export function NotFound({ 
  message = "404", 
  details = "抱歉，您访问的页面似乎飞走了。" 
}: NotFoundProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="relative">
        <h1 className="text-[12rem] font-black text-gray-900/5 dark:text-white/5 select-none leading-none">
          404
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
            <svg 
              className="w-full h-full text-indigo-500 relative z-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M8 9h.01M16 9h.01M15 16a3 3 0 00-6 0" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            {message === "404" ? "页面未找到" : message}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
            {details}
          </p>
          <Link
            to="/"
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:scale-105 transition-all active:scale-95 shadow-lg shadow-gray-900/10 dark:shadow-none"
          >
            返回首页
          </Link>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="mt-12 flex gap-4">
        <div className="w-2 h-2 rounded-full bg-indigo-500/40" />
        <div className="w-2 h-2 rounded-full bg-purple-500/40" />
        <div className="w-2 h-2 rounded-full bg-pink-500/40" />
      </div>
    </div>
  );
}
