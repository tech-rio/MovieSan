import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Bookmark } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useEffect, useState } from "react";
import { GlobalSearch } from "./GlobalSearch";

const nav = [
  { to: "/", label: "Home" },
  { to: "/browse/movie", label: "Movies" },
  { to: "/browse/tv", label: "TV Shows" },
  { to: "/watchlist", label: "Watchlist" },
] as const;

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAuthenticated, signInMock, signOut } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-300 -z-10 ${
          scrolled ? "header-glass" : "bg-transparent"
        }`}
      />
      <div className="relative z-10 w-full flex items-center justify-between gap-6 px-6 lg:px-10 h-16">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">
              MOVIES<span className="text-primary">ALERT</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <GlobalSearch />
          <button className="size-10 grid place-items-center rounded-full glass hover:bg-secondary transition">
            <Bell className="size-4" />
          </button>
          <Link
            to="/watchlist"
            className="size-10 grid place-items-center rounded-full glass hover:bg-secondary transition"
          >
            <Bookmark className="size-4" />
          </Link>
          {isAuthenticated && user ? (
            <button onClick={signOut} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass hover:bg-secondary transition">
              <img src={user.avatarUrl} alt={user.name} className="size-8 rounded-full object-cover" />
              <span className="text-sm hidden lg:inline">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              onClick={signInMock}
              className="px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium hover:shadow-glow transition-shadow"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
