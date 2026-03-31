import { Hero } from "@/components/Hero";
import { ProjectCard, MacbookPreview } from "@/components/Projects";
import { Timeline } from "@/components/Timeline";
import { AnimatedSkills } from "@/components/AnimatedSkills";
import { ScrollLine } from "@/components/ScrollLine";
import { FloatingNav } from "@/components/FloatingNav";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background selection:bg-primary/30">
      {/* Full-page warm orange gradient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base gradient: warm brown-orange flow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(20,35%,10%)] via-[hsl(25,40%,12%)] to-[hsl(18,30%,9%)]" />
        {/* Bright amber glow — top */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[90vw] h-[50vh] bg-orange-600/20 rounded-full blur-[200px]" />
        {/* Warm orange wash — mid page */}
        <div className="absolute top-[35%] left-1/3 w-[70vw] h-[50vh] bg-amber-700/25 rounded-full blur-[180px]" />
        {/* Deep orange glow — lower section */}
        <div className="absolute top-[60%] right-1/4 w-[60vw] h-[45vh] bg-orange-800/20 rounded-full blur-[160px]" />
        {/* Warm amber accent — bottom */}
        <div className="absolute top-[85%] left-1/2 -translate-x-1/2 w-[50vw] h-[30vh] bg-amber-600/15 rounded-full blur-[140px]" />
      </div>
      <div className="relative z-10">
        <Hero />

        {/* ── Segment 1: Skills → Project card (line stops before MacBook) ── */}
        <ScrollLine>
          <AnimatedSkills />
          <ProjectCard />
        </ScrollLine>

        {/* ── MacBook preview — no line behind it ── */}
        <MacbookPreview />

        {/* ── Segment 2: Timeline (line resumes after MacBook) ── */}
        <ScrollLine>
          <Timeline />
        </ScrollLine>
      </div>

      {/* ── Floating dock navigation ── */}
      <FloatingNav />
    </main>
  );
}
