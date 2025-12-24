import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router";
import logo from "../assets/logo.webp";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Navbar({ 
  setIsSearchOpen 
}: { 
  setIsSearchOpen: (open: boolean) => void 
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Sync theme state with document class on mount and whenever it changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Listen for class changes on html element (optional but good for sync)
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      setTheme(isDarkNow ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMenuOpen]);

  useGSAP(() => {
    if (isMenuOpen) {
      gsap.fromTo(mobileMenuRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
      );
      
      const menuLinks = mobileMenuRef.current?.querySelectorAll('a');
      if (menuLinks) {
        gsap.fromTo(menuLinks,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 0.1, ease: "power3.out" }
        );
      }
    }
  }, { dependencies: [isMenuOpen] });

  useGSAP(() => {
    const nav = navRef.current;
    const container = containerRef.current;
    const links = linksRef.current;

    if (!nav || !container) return;

    // Refresh ScrollTrigger on route change
    ScrollTrigger.refresh();

    const shortenTl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "+=200",
        scrub: 1,
        invalidateOnRefresh: true,
      }
    });

    shortenTl.to(nav, {
      y: -12,
      width: () => (window.innerWidth < 768) ? "calc(100% - 3rem)" : "50%",
      maxWidth: () => (window.innerWidth < 768) ? "none" : "420px",
      ease: "none",
    }, 0);

    shortenTl.to(container, {
      paddingLeft: () => (window.innerWidth < 768) ? "1.5rem" : "1rem",
      paddingRight: () => (window.innerWidth < 768) ? "1.5rem" : "1rem",
      paddingTop: () => (window.innerWidth < 768) ? "0.75rem" : "0.4rem",
      paddingBottom: () => (window.innerWidth < 768) ? "0.75rem" : "0.4rem",
      backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.6)",
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      ease: "none",
    }, 0);

    if (links) {
      shortenTl.to(links, {
        opacity: 0,
        scale: 0.8,
        pointerEvents: "none",
        ease: "none",
      }, 0);
    }
  }, { dependencies: [theme, location.pathname] });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    // We don't necessarily need to setTheme here as the MutationObserver will catch it,
    // but it's faster for UI response.
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
          className="flex items-center gap-3 hover:opacity-80 transition-opacity active:scale-95 duration-200 relative z-[60]"
        >
          <img src={logo} alt="Project Butterfly Logo" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold text-gray-900 dark:text-white select-none tracking-tight hidden md:block">
            Project Butterfly
          </span>
        </Link>

        {/* Center Links (Desktop) */}
        <div ref={linksRef} className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-8">
          <NavLink 
            to="/articles" 
            className={({ isActive }) => 
              `text-sm font-medium transition-colors relative group ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                文章
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 ${
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </>
            )}
          </NavLink>
          <NavLink 
            to="/archive" 
            className={({ isActive }) => 
              `text-sm font-medium transition-colors relative group ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                归档
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 ${
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </>
            )}
          </NavLink>
        </div>

        {/* Controls */}
        <div ref={controlsRef} className="flex items-center gap-2 relative z-[60]">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all group border border-transparent hover:border-black/10 dark:hover:border-white/10"
            aria-label="Search"
          >
            <svg 
              className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors hidden sm:inline-block">
              搜索...
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group overflow-hidden"
            aria-label="Toggle theme"
          >
            <div className="relative w-6 h-6">
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

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all group"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 relative flex flex-col items-center justify-center gap-1">
              <span className={`w-5 h-0.5 bg-gray-600 dark:text-gray-400 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`w-5 h-0.5 bg-gray-600 dark:text-gray-400 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`w-5 h-0.5 bg-gray-600 dark:text-gray-400 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="sm:hidden absolute top-full left-0 right-0 mt-4 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-3xl shadow-2xl z-40"
        >
          <div className="flex flex-col gap-2">
            <NavLink 
              to="/" 
              className={({ isActive }) => `
                px-6 py-4 rounded-2xl text-lg font-bold transition-all
                ${isActive 
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"}
              `}
            >
              首页
            </NavLink>
            <NavLink 
              to="/articles" 
              className={({ isActive }) => `
                px-6 py-4 rounded-2xl text-lg font-bold transition-all
                ${isActive 
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"}
              `}
            >
              文章
            </NavLink>
            <NavLink 
              to="/archive" 
              className={({ isActive }) => `
                px-6 py-4 rounded-2xl text-lg font-bold transition-all
                ${isActive 
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"}
              `}
            >
              归档
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}
