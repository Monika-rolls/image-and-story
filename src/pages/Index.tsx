import { useState } from "react";
import NeuralBackground from "@/components/NeuralBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import EventsSection from "@/components/EventsSection";
import ContactSection from "@/components/ContactSection";
import CinematicIntro from "@/components/CinematicIntro";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import AIChatWidget from "@/components/AIChatWidget";

const Index = () => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      <CustomCursor />
      <ScrollProgress />
      {!introComplete && <CinematicIntro onComplete={() => setIntroComplete(true)} />}
      <NeuralBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <EventsSection />
        <ContactSection />
      </main>
      <AIChatWidget />
    </div>
  );
};

export default Index;
