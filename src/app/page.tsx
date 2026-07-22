import LoadingScreen from "@/components/layout/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import WorkSection from "@/components/sections/WorkSection";
import AboutSection from "@/components/sections/AboutSection";
import SectorSection from "@/components/sections/SectorSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main className="relative">
      <LoadingScreen />
      <Navbar />
      <HeroSection />
      <WorkSection />
      <AboutSection />
      <SectorSection />
      <ContactSection />
    </main>
  );
}
