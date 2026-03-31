"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Briefcase, Terminal, CheckCircle2 } from "lucide-react";
import { useRef } from "react";
import { ConnectedCard } from "@/components/ConnectedCard";

const experiences = [
  {
    role: "Test Engineer 1",
    company: "Hyland Software Solutions LLP",
    location: "Kolkata",
    duration: "July 2024 - Present",
    highlights: [
      "Built GitHub Actions CI/CD pipelines integrating Selenium, Playwright, and Cypress suites",
      "Architected reusable test framework with 80-90% code reusability across 1000+ test cases",
      "Utilized GitHub Copilot, Claude Code, and Aider daily to accelerate testing workflows",
      "Automated reporting via Google Gemini API + GitHub Actions, cutting turnaround by 40%",
    ]
  },
  {
    role: "QA Automation Engineer (Programmer Analyst)",
    company: "Cognizant Technology Solutions",
    location: "Kolkata",
    duration: "Jan 2022 - June 2024",
    highlights: [
      "Designed end-to-end Selenium C# framework for a US government healthcare platform",
      "Delivered 700+ automated test cases and built a reusable CommonFunction library",
      "Integrated with Azure DevOps pipelines, achieving 30% reduction in production defects",
      "Implemented BDD via Cucumber and SpecFlow, improving maintainability by 35%",
    ]
  }
];

function TimelineCardContent({ exp, index }: { exp: (typeof experiences)[number]; index: number }) {
  return (
    <div className="group relative rounded-[2rem] border border-white/5 bg-card/50 backdrop-blur-md p-6 md:p-8 shadow-[0_0_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_60px_-10px_rgba(217,119,6,0.15)] hover:border-primary/20 hover:bg-card transition-all duration-500">
      <div className="flex flex-col space-y-2 mb-6">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold w-fit mb-2">
          {exp.duration}
        </span>
        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{exp.role}</h3>
        <p className="text-muted-foreground font-medium text-base md:text-lg">{exp.company}</p>
      </div>
      <ul className="space-y-3">
        {exp.highlights.map((highlight, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className="flex gap-3 text-muted-foreground text-sm md:text-base leading-relaxed"
          >
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0 mt-0.5" />
            <span>{highlight}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function Timeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.3"],
  });
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const sectionY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  return (
    <section id="experience" ref={sectionRef} className="relative py-32 w-full">
      <motion.div
        style={{ opacity: sectionOpacity, y: sectionY }}
        className="flex flex-col items-center gap-4 mb-20 text-center px-4 sm:px-6 lg:px-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="p-4 rounded-[1.2rem] bg-primary/10 text-primary border border-primary/20 shadow-inner"
        >
          <Briefcase className="w-8 h-8" />
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
          Experience
        </h2>
      </motion.div>

      {/* Timeline Cards connected to center line */}
      <div className="flex flex-col gap-12 md:gap-16 px-4 sm:px-6 lg:px-12">
        {experiences.map((exp, index) => (
          <ConnectedCard
            key={index}
            side={index % 2 === 0 ? "left" : "right"}
            nodeIcon={<Terminal className="w-4 h-4 md:w-5 md:h-5" />}
          >
            <TimelineCardContent exp={exp} index={index} />
          </ConnectedCard>
        ))}
      </div>
    </section>
  );
}
