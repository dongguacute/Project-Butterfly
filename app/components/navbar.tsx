import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import logo from "../assets/logo.webp";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const nav = navRef.current;
    const container = containerRef.current;

    if (!nav || !container) return;

    gsap.to(nav, {
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "+=200",
        scrub: 1,
        invalidateOnRefresh: true,
      },
      y: -12,
      width: (window.innerWidth < 768) ? "calc(100% - 3rem)" : "50%",
      maxWidth: (window.innerWidth < 768) ? "none" : "420px",
      ease: "none",
    });

    gsap.to(container, {
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "+=200",
        scrub: 1,
        invalidateOnRefresh: true,
      },
      paddingLeft: (window.innerWidth < 768) ? "1.5rem" : "1rem",
      paddingRight: (window.innerWidth < 768) ? "1.5rem" : "1rem",
      paddingTop: (window.innerWidth < 768) ? "0.75rem" : "0.4rem",
      paddingBottom: (window.innerWidth < 768) ? "0.75rem" : "0.4rem",
      backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.6)",
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      ease: "none",
    });
  }, { scope: navRef, dependencies: [theme] });

  useEffect(() => {
    // Sync state with the actual class on html element
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <nav ref={navRef} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-5xl">
      <div ref={containerRef} className="flex items-center justify-between px-6 py-3 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] ring-1 ring-white/20">
        <Link 
          to="/" 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity active:scale-95 duration-200"
        >
          <img src={logo} alt="Project Butterfly Logo" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold text-gray-900 dark:text-white select-none tracking-tight hidden md:block">
            Project Butterfly
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group overflow-hidden"
          aria-label="Toggle theme"
        >
          <div className="relative w-6 h-6">
            {/* Sun Icon */}
            <svg
              className={`absolute inset-0 transition-all duration-500 transform ${
                theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            {/* Moon Icon */}
            <svg
              className={`absolute inset-0 transition-all duration-500 transform ${
                theme === "light" ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
        </button>
      </div>
    </nav>
  );
}
