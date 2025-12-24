import { Link } from "react-router";
import logo from "../assets/logo.webp";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-20 px-4 pb-4">
      <div className="max-w-[1600px] mx-auto bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-[3rem] shadow-[0_-8px_32px_0_rgba(31,38,135,0.05)]">
        <div className="max-w-5xl mx-auto px-8 py-12 md:py-16">
          <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side: Logo and Slogan */}
            <div className="flex flex-col gap-6">
              <Link 
                to="/" 
                className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit"
              >
                <img src={logo} alt="Project Butterfly Logo" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Project Butterfly
                </span>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-md">
                一本美丽蜕变日记，希望每个人都能成为自己想成为的自己。
              </p>
            </div>

            {/* Right side: Info */}
            <div className="flex flex-col md:items-end gap-8">
              <div className="flex flex-col md:items-end gap-2">
                <p className="text-sm text-gray-400 dark:text-gray-500" suppressHydrationWarning>
                  © {currentYear} Project Butterfly. All rights reserved.
                </p>
                <div className="flex gap-4">
                  {/* Social placeholders */}
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative background element removed or adjusted for full width if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}
