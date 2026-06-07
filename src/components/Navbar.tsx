import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MagneticButton from "./MagneticButton";

const navItems = ["About", "Skills", "Experience", "Projects", "Events", "Contact"];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Detect active section
      const sections = navItems.map((item) => ({
        id: item.toLowerCase(),
        el: document.getElementById(item.toLowerCase()),
      }));

      for (const section of sections.reverse()) {
        if (section.el) {
          const rect = section.el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-500 ${
        scrolled
          ? "border-border/50 bg-background/80 shadow-[0_4px_30px_hsl(var(--primary)/0.05)]"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <MagneticButton
          href="#"
          className="flex items-center gap-2 font-display text-sm tracking-widest text-primary"
          strength={0.4}
        >
          <Brain className="w-5 h-5" />
          MONIKA.AI
        </MagneticButton>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <MagneticButton
              key={item}
              href={`#${item.toLowerCase()}`}
              strength={0.3}
            >
              <span
                className={`font-heading text-sm tracking-wide transition-all duration-300 relative py-1 ${
                  activeSection === item.toLowerCase()
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
                {/* Active indicator dot */}
                {activeSection === item.toLowerCase() && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 8px hsl(265, 85%, 65%, 0.6)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </span>
            </MagneticButton>
          ))}
          <Link to="/blog" className="font-heading text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all">
            Blog
          </Link>
        </div>

        <MagneticButton
          href="#contact"
          className="px-4 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary font-heading text-sm hover:bg-primary/20 transition-all glow-box relative overflow-hidden group"
          strength={0.4}
        >
          <span className="relative z-10">Connect</span>
          {/* Hover fill animation */}
          <span className="absolute inset-0 bg-primary/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </MagneticButton>
      </div>
    </motion.nav>
  );
};

export default Navbar;
