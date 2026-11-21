import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { links } from "@/content/profile";

const items = [
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Open source", href: "/#open-source" },
  { label: "Writing", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export const ThemeToggle = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* private mode: the choice just won't persist */
    }
    setDark(next);
  };
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
    >
      {dark ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />}
    </button>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm transition-colors duration-150 ${
        scrolled ? "border-border" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6">
        <Link to="/" className="text-[15px] font-medium text-foreground">
          Monika Kusumanchi
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {items.map((item) =>
            item.href.startsWith("/#") ? (
              <a key={item.label} href={item.href} className="text-[14px] text-muted-foreground transition-colors duration-150 hover:text-foreground">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.href} className="text-[14px] text-muted-foreground transition-colors duration-150 hover:text-foreground">
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a
            href={links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex h-9 items-center rounded-[10px] border border-border bg-card px-3.5 text-[14px] font-medium text-foreground transition-colors duration-150 hover:bg-secondary"
          >
            Resume
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
