import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownToLine, Volume2, VolumeX } from "lucide-react";
import { links } from "@/content/profile";
import { EASE, Readout, btnPrimary, btnSecondary } from "./site/ui";

const readouts = [
  { value: "92%", label: "call-insight accuracy in production at Runo" },
  { value: "0.8 s", label: "camera scan, on the phone, offline" },
  { value: "21,699", label: "parameters in a game policy on an ESP32" },
];

const HeroSection = () => {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Starts muted (browsers only autoplay silent video); the button turns the voice on.
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) {
      v.volume = 0.9;
      if (v.currentTime > 0.5 && !v.paused) v.currentTime = 0; // start the hello from the beginning
      v.play().catch(() => {});
    }
    setMuted(v.muted);
  };
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
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-14 md:pb-28 md:pt-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
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

      <motion.figure {...rise(5)} className="mx-auto w-full max-w-[440px]">
        <div className="relative overflow-hidden rounded-[20px] border border-border bg-secondary shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <video
            ref={videoRef}
            src="/media/intro.mp4"
            poster="/media/intro-poster.jpg"
            className="aspect-[4/5] w-full object-cover object-[48%_center]"
            autoPlay={!reduce}
            muted
            loop
            playsInline
            preload="auto"
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            aria-label="Monika introducing herself"
          />
          <button
            onClick={toggleSound}
            aria-pressed={!muted}
            className="absolute bottom-3 left-3 inline-flex h-9 items-center gap-2 rounded-[10px] border border-border bg-card/95 px-3 text-[13px] font-medium text-foreground transition-colors duration-150 hover:bg-card active:scale-[0.98]"
          >
            {muted ? <VolumeX className="h-4 w-4" strokeWidth={1.5} /> : <Volume2 className="h-4 w-4" strokeWidth={1.5} />}
            {muted ? "Sound on" : "Sound off"}
          </button>
        </div>
        <figcaption className="mt-3 text-center text-[13px] text-subtle">A ten-second hello. Turn the sound on to hear it.</figcaption>
      </motion.figure>
    </section>
  );
};

export default HeroSection;
