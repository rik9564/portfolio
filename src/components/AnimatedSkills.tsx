"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { ConnectedCard } from "@/components/ConnectedCard";

/* ─── SVG Icon paths for each tool (simple recognizable shapes) ─── */
const toolIcons: Record<string, string> = {
  Selenium: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  Playwright: "M3 3h18v18H3V3zm2 2v14h14V5H5zm2 3h4v2H7V8zm0 4h10v2H7v-2zm0 4h7v2H7v-2zm6-8h4v2h-4V8z",
  Cypress: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v-4h4V8h-6v8z",
  TestNG: "M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2zm-2-3h2v2H2v-2zm0-7h2v2H2V8zm0-5h2v2H2V3z",
  Cucumber: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-3 4h6v1.5H9V9zm-1 3h8v1.5H8V12zm1 3h6v1.5H9V15z",
  "GitHub Actions": "M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.21.66-.47 0-.23-.01-.82-.01-1.61-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85.004 1.71.115 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.16.57.67.47A10.003 10.003 0 0022 12c0-5.52-4.48-10-10-10z",
  "Azure DevOps": "M22 4v16l-6 2V2l6 2zM2 6l6-2v16l-6-2V6zm8-2h4v16h-4V4z",
  Docker: "M21.81 10.25c-.06-.04-.56-.43-1.64-.43-.22 0-.45.02-.68.06-.23-1.6-1.4-2.38-1.46-2.42l-.29-.17-.18.28c-.23.36-.41.76-.53 1.17-.23.79-.18 1.53.14 2.17-.61.34-1.59.42-1.8.43H2.14c-.24 0-.43.19-.44.43-.02.65.04 1.29.17 1.92.18.84.53 1.57 1.03 2.15.57.65 1.37 1.1 2.4 1.34.56.13 1.18.2 1.83.2 1.05 0 2.15-.2 3.18-.59.81-.31 1.54-.76 2.17-1.32.76-.68 1.34-1.5 1.72-2.38h.15c.93 0 1.5-.38 1.82-.71.21-.22.38-.48.49-.77l.07-.2-.14-.1zM3.17 11.75h2.16c.1 0 .19-.08.19-.19V9.6c0-.1-.08-.19-.19-.19H3.17c-.1 0-.19.08-.19.19v1.96c0 .1.09.19.19.19zm3 0h2.16c.1 0 .19-.08.19-.19V9.6c0-.1-.08-.19-.19-.19H6.17c-.1 0-.19.08-.19.19v1.96c0 .1.09.19.19.19zm3.03 0h2.16c.1 0 .19-.08.19-.19V9.6c0-.1-.08-.19-.19-.19H9.2c-.1 0-.19.08-.19.19v1.96c0 .1.09.19.19.19zm3 0h2.16c.1 0 .19-.08.19-.19V9.6c0-.1-.09-.19-.19-.19H12.2c-.1 0-.19.08-.19.19v1.96c0 .1.09.19.19.19zm-5.99-3h2.16c.1 0 .19-.08.19-.19V6.6c0-.1-.09-.19-.19-.19H6.21c-.1 0-.19.08-.19.19v1.96c0 .1.08.19.19.19zm3 0h2.16c.1 0 .19-.08.19-.19V6.6c0-.1-.08-.19-.19-.19H9.2c-.1 0-.19.08-.19.19v1.96c0 .1.09.19.19.19zm3 0h2.16c.1 0 .19-.08.19-.19V6.6c0-.1-.09-.19-.19-.19H12.2c-.1 0-.19.08-.19.19v1.96c0 .1.09.19.19.19z",
  Jenkins: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
  Git: "M21.62 11.11l-8.73-8.73a1.3 1.3 0 00-1.84 0L9.2 4.22l2.33 2.33a1.54 1.54 0 011.96 1.96l2.24 2.24a1.54 1.54 0 11-.92.86L12.66 9.5v5.04a1.54 1.54 0 11-1.27-.07V9.35a1.54 1.54 0 01-.84-2.02L8.26 5.06l-5.88 5.88a1.3 1.3 0 000 1.84l8.73 8.73a1.3 1.3 0 001.84 0l8.67-8.67a1.3 1.3 0 000-1.84z",
  Vagrant: "M4 3l4.5 15h1L12 11l2.5 7h1L20 3h-3l-2.5 9L12 5h-1L8.5 12 6 3H4z",
  "GitHub Copilot": "M12 2a10 10 0 100 20 10 10 0 000-20zm-2 14l-4-4 1.4-1.4L10 13.2l6.6-6.6L18 8l-8 8z",
  "Claude Code": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c4.42 0 8 3.58 8 8s-3.58 8-8 8-8-3.58-8-8 3.58-8 8-8zm-2 3v2h4V7h-4zm-3 4v2h10v-2H7zm2 4v2h6v-2H9z",
  "Gemini API": "M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L20 9v6l-8 4-8-4V9l8-4.82z",
  Postman: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V8c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1z",
  NUnit: "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z",
  MSTest: "M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h4v4H7V7zm6 0h4v4h-4V7zM7 13h4v4H7v-4zm6 0h4v4h-4v-4z",
  SpecFlow: "M12 2l-5.5 9h11L12 2zm0 4.36L14.12 11H9.88L12 6.36zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z",
  "Robot Framework": "M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 013 3v1h1.27c.34-.6.99-1 1.73-1a2 2 0 010 4c-.74 0-1.39-.4-1.73-1H18v1a3 3 0 01-3 3h-1v1.27c.6.34 1 .99 1 1.73a2 2 0 01-4 0c0-.74.4-1.39 1-1.73V17h-1a3 3 0 01-3-3v-1H6.73c-.34.6-.99 1-1.73 1a2 2 0 010-4c.74 0 1.39.4 1.73 1H8v-1a3 3 0 013-3h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z",
  Jira: "M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 00-.84-.84H11.53zM6.77 6.8a4.36 4.36 0 004.34 4.34h1.78v1.72a4.36 4.36 0 004.34 4.34V7.63a.84.84 0 00-.83-.83H6.77zM2 11.6a4.35 4.35 0 004.34 4.34h1.78v1.72c0 2.4 1.94 4.34 4.34 4.34v-9.57a.84.84 0 00-.84-.83H2z",
  Confluence: "M2.34 17.09c-.17.28-.1.64.16.83l4.6 3.22c.27.19.64.11.82-.17.98-1.58 2.77-1.86 5.47-.87 2.7.99 4.35.61 5.87-.97.14-.14.22-.33.22-.53V4.4c0-.42-.5-.64-.8-.35-1.52 1.44-3.15 1.96-5.87.97-2.7-.99-4.49-.7-5.47.87L2.34 17.09z",
  "REST APIs": "M14 12l-2 2-2-2 2-2 2 2zm-2-6l2.12 2.12 2.5-2.5L12 1 7.38 5.62l2.5 2.5L12 6zm-6 6l2.12-2.12-2.5-2.5L1 12l4.62 4.62 2.5-2.5L6 12zm12 0l-2.12 2.12 2.5 2.5L23 12l-4.62-4.62-2.5 2.5L18 12zm-6 6l-2.12-2.12-2.5 2.5L12 23l4.62-4.62-2.5-2.5L12 18z",
};

/* ─── Ticker items: single combined row ─── */
const allTickerItems = [
  "Selenium", "Playwright", "Cypress", "TestNG", "Cucumber",
  "GitHub Actions", "Azure DevOps", "Docker", "REST APIs", "Git",
  "GitHub Copilot", "Claude Code", "Gemini API", "Postman", "Jenkins",
  "NUnit", "MSTest", "SpecFlow", "Robot Framework", "Vagrant",
];

/* ─── Skill Card Data ─── */
const skillCards = [
  {
    title: "Test Automation",
    subtitle: "Selenium  /  Playwright  /  Cypress",
    description:
      "Architecting enterprise-grade E2E testing frameworks from scratch. 80-90% code reusability across 1000+ test cases.",
    images: [
      { src: "/selenium.png", alt: "Selenium" },
      { src: "/playwright.png", alt: "Playwright" },
      { src: "/cypress.png", alt: "Cypress" },
    ],
    accent: "from-amber-500/20 to-orange-500/20",
  },
  {
    title: "CI/CD & DevOps",
    subtitle: "GitHub Actions  /  Azure DevOps  /  Jenkins",
    description:
      "Engineering zero-touch delivery pipelines. Automated test triggers, environment provisioning, and deployment confidence.",
    images: [
      { src: "/github-actions.png", alt: "GitHub Actions" },
      { src: "/cicd.png", alt: "CI/CD Pipeline" },
    ],
    accent: "from-fuchsia-500/20 to-pink-500/20",
  },
  {
    title: "AI-Accelerated Dev",
    subtitle: "Copilot  /  Claude Code  /  Gemini API",
    description:
      "Pioneering AI coding assistants in QA workflows. Auto-generating test scripts, debugging regressions, and producing stakeholder reports.",
    images: [
      { src: "/ai.png", alt: "AI Tools" },
    ],
    accent: "from-purple-500/20 to-pink-500/20",
  },
];

/* ─── Company/Logo-style Ticker ─── */
function TickerRow({ items, speed }: { items: string[]; speed: number }) {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden w-full py-4">
      {/* Center-highlight mask: dark edges → bright center → dark edges */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
          background: "transparent",
        }}
      />
      {/* Extra fade overlays for a stronger dark-to-light-to-dark effect */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, var(--background) 0%, transparent 15%, transparent 85%, var(--background) 100%)",
        }}
      />

      <motion.div
        className="flex gap-6 whitespace-nowrap w-max items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform" }}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors duration-300 group cursor-default"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-muted-foreground/50 group-hover:text-primary transition-colors duration-300 shrink-0"
              fill="currentColor"
            >
              <path d={toolIcons[item] || toolIcons["REST APIs"]} />
            </svg>
            <span className="text-sm font-semibold text-muted-foreground/70 group-hover:text-foreground transition-colors duration-300 tracking-wide">
              {item}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Skill Card Content (just the visual card, no positioning) ─── */
function SkillCardContent({
  card,
  index,
}: {
  card: (typeof skillCards)[number];
  index: number;
}) {
  return (
    <div className="group relative rounded-[2rem] border border-white/[0.06] bg-card/80 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_80px_-15px_rgba(217,119,6,0.15)] hover:border-primary/20 transition-all duration-500 h-full flex flex-col">
      <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col flex-1">
        <div className="space-y-2">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary/70">
            {String(index + 1).padStart(2, "0")} — {card.subtitle}
          </span>
          <h3 className="text-2xl lg:text-3xl font-black tracking-tight leading-[1.1]">
            {card.title}
          </h3>
        </div>

        <p className="text-muted-foreground text-sm lg:text-base leading-relaxed mt-5">
          {card.description}
        </p>

        {/* Images area — fixed height for consistency */}
        <div className="flex gap-3 pt-4 mt-auto" style={{ height: 140 }}>
          {card.images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="relative flex-1 h-full rounded-xl overflow-hidden border border-white/[0.08] shadow-lg group/img"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                quality={85}
                className="object-cover object-top group-hover/img:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-white/70 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                {img.alt}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Section ─── */
export function AnimatedSkills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const sectionY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  return (
    <section id="skills" ref={sectionRef} className="relative py-32 w-full overflow-hidden">
      <motion.div
        style={{ opacity: sectionOpacity, y: sectionY }}
        className="flex flex-col items-center text-center space-y-4 mb-12 px-4 sm:px-6 lg:px-12"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">
          Core Capabilities
        </h2>
        <p className="max-w-2xl text-muted-foreground text-lg lg:text-xl">
          Transforming complex workflows into beautifully automated systems.
        </p>
      </motion.div>

      {/* Full-width Horizontal Logo Ticker — single row */}
      <div className="mb-20">
        <TickerRow items={allTickerItems} speed={50} />
      </div>

      {/* Skill Cards connected to center line */}
      <div className="flex flex-col gap-12 md:gap-16 px-4 sm:px-6 lg:px-12">
        {skillCards.map((card, index) => (
          <ConnectedCard
            key={index}
            side={index % 2 === 0 ? "left" : "right"}
          >
            <div style={{ minHeight: 340 }} className="h-full">
              <SkillCardContent card={card} index={index} />
            </div>
          </ConnectedCard>
        ))}
      </div>
    </section>
  );
}
