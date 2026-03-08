import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Mail, Phone, Linkedin, Github } from "lucide-react";
import MagneticButton from "./MagneticButton";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [60, -20]);

  return (
    <section id="contact" className="relative py-24 neural-grid overflow-hidden" ref={ref}>
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [40, -80]) }}
        className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none"
      />

      <motion.div style={{ y: contentY }} className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-sm tracking-[0.3em] text-primary mb-2">// CONTACT</h2>
          <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Initiate Connection
          </h3>
          <p className="font-body text-lg text-muted-foreground mb-12">
            Ready to build something intelligent together? Let's connect.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { href: "mailto:kusumonika033@gmail.com", icon: Mail, text: "kusumonika033@gmail.com" },
              { href: "tel:+916281074516", icon: Phone, text: "+91 6281074516" },
            ].map((item) => (
              <MagneticButton
                key={item.text}
                href={item.href}
                strength={0.3}
                className="flex items-center gap-3 px-6 py-3 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all group relative overflow-hidden"
              >
                <item.icon className="w-5 h-5 text-primary relative z-10" />
                <span className="font-heading text-sm text-foreground relative z-10">{item.text}</span>
                {/* Hover bg sweep */}
                <span className="absolute inset-0 bg-primary/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </MagneticButton>
            ))}
          </div>

          <div className="flex justify-center gap-6">
            {[
              { icon: Linkedin, label: "LinkedIn", href: "#" },
              { icon: Github, label: "GitHub", href: "#" },
            ].map((social) => (
              <MagneticButton
                key={social.label}
                href={social.href}
                strength={0.5}
                className="w-12 h-12 rounded-full border border-border bg-card/50 flex items-center justify-center hover:border-primary/40 hover:shadow-[0_0_15px_hsl(175,80%,50%,0.2)] transition-all group"
              >
                <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110 transform duration-200" />
              </MagneticButton>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-20 pt-8 border-t border-border/50"
        >
          <p className="font-body text-xs text-muted-foreground tracking-wider">
            © 2026 Monika Kusumanchi • Designed with neural precision
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
