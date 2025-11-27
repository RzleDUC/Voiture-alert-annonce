import HeroSection from "@/components/home/HeroSection";
import ProjectInfoCard from "@/components/home/ProjectInfoCard";

export default function Home() {
  return (
    <main className="space-y-4 md:space-y-6">
      <HeroSection />
      <ProjectInfoCard />
    </main>
  );
}
