import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownToLine } from "lucide-react";
import { links } from "@/content/profile";
import { EASE, Readout, btnPrimary, btnSecondary } from "./site/ui";

const readouts = [
  { value: "92%", label: "call-insight accuracy in production at Runo" },
  { value: "0.8 s", label: "camera scan, on the phone, offline" },
  { value: "21,699", label: "parameters in a game policy on an ESP32" },
];

const HeroSection = () => {
  const reduce = useReducedMotion();
  // The only entrance animation on the site: a short fade and rise, staggered.
  const rise = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay: 0.05 + i * 0.05, ease: EASE },
        };

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-14 md:pb-28 md:pt-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20">
      <div>
        <motion.p {...rise(0)} className="text-[15px] text-muted-foreground">
          AI engineer · Hyderabad
        </motion.p>
        <motion.h1
          {...rise(1)}
          className="mt-5 text-[40px] font-medium leading-[1.06] tracking-[-0.03em] text-foreground md:text-[60px] md:leading-[1.03]"
        >
          I build voice agents and LLM systems that run in production, and small models that run on a phone.
        </motion.h1>
        <motion.p {...rise(2)} className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          At Runo I ship outbound voice agents, call analytics and a CRM copilot. On the side I make models small enough
          for phones and microcontrollers, and write up what I measure, including what didn't work.
        </motion.p>
        <motion.div {...rise(3)} className="mt-8 flex flex-wrap gap-3">
          <a href={links.resume} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
            <ArrowDownToLine className="h-4 w-4" strokeWidth={1.5} />
            Download resume
          </a>
          <a href="#contact" className={btnSecondary}>
            Get in touch
          </a>
        </motion.div>
        <motion.div {...rise(4)} className="mt-12 grid max-w-xl grid-cols-1 gap-5 sm:grid-cols-3">
          {readouts.map((r) => (
            <Readout key={r.label} {...r} />
          ))}
        </motion.div>
      </div>

      <motion.figure {...rise(5)} className="mx-auto w-full max-w-[300px] lg:max-w-[320px]">
        <div className="overflow-hidden rounded-[32px] border border-border bg-card p-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <video
            src="/blog/videos/mojo-scan-text.mp4"
            poster="/blog/images/mojo-scan-text-poster.jpg"
            className="aspect-[540/1200] w-full rounded-[24px] bg-secondary object-cover"
            autoPlay={!reduce}
            muted
            loop
            playsInline
            controls={!!reduce}
            preload="metadata"
            aria-label="Screen recording: Mojo reads a receipt, copies a line, then boxes the objects on a milk label"
          />
        </div>
        <figcaption className="mt-4 text-center text-[13px] leading-snug text-subtle">
          Mojo, my phone assistant, reading a receipt with no network.{" "}
          <a href="/blog/offline-phone-assistant-eyes-and-internet" className="text-muted-foreground underline decoration-border underline-offset-4 hover:decoration-primary">
            How it works
          </a>
        </figcaption>
      </motion.figure>
    </section>
  );
};

export default HeroSection;
