import { Link } from "react-router";
import logo from "../assets/logo.webp";

export function Welcome() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center gap-10 min-h-screen text-center py-20">
        <header className="flex flex-col items-center gap-8 px-4">
          <div className="w-48 h-48 md:w-64 md:h-64 animate-float">
            <img
              src={logo}
              alt="Project Butterfly Logo"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tighter">
              Project Butterfly
            </h1>
            <div className="space-y-2">
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium tracking-wide">
                一本美丽蜕变日记
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-500 max-w-md mx-auto leading-relaxed">
                希望每个人都能成为自己想成为的自己
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-[400px] w-full space-y-8 px-4">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />
          
          <Link
            to="/articles"
            className="group relative flex items-center justify-center w-full py-4 px-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 active:scale-98 overflow-hidden"
          >
            <span className="text-lg font-medium tracking-wide">
              开始阅读
            </span>
            
            <svg 
              className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
