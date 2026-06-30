import LoadingScreen from "@/components/layout/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import SectorSection from "@/components/sections/SectorSection";

export default function Home() {
  return (
    <main className="relative">
      <LoadingScreen />
      <Navbar />
      <HeroSection />
      <SectorSection />
    </main>
  );
}
