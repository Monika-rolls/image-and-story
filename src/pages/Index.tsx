import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedWork from "@/components/FeaturedWork";
import ExperienceSection from "@/components/ExperienceSection";
import OpenSourceSection from "@/components/OpenSourceSection";
import ProjectsSection from "@/components/ProjectsSection";
import WritingSection from "@/components/WritingSection";
import ContactSection from "@/components/ContactSection";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <HeroSection />
      <FeaturedWork />
      <ExperienceSection />
      <OpenSourceSection />
      <ProjectsSection />
      <WritingSection />
      <ContactSection />
    </main>
  </div>
);

export default Index;
