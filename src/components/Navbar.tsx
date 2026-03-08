import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const navItems = ["About", "Skills", "Experience", "Projects", "Contact"];

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/70"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-display text-sm tracking-widest text-primary">
          <Brain className="w-5 h-5" />
          MONIKA.AI
        </a>
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-heading text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide"
            >
              {item}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="px-4 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary font-heading text-sm hover:bg-primary/20 transition-colors glow-box"
        >
          Connect
        </a>
      </div>
    </motion.nav>
  );
};

export default Navbar;
