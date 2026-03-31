"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useRef } from "react";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { IPhoneFrame } from "@/components/ui/iphone-frame";
import { ConnectedCard } from "@/components/ConnectedCard";

/**
 * Project info card — connects to the center scroll line.
 * iPhone live preview on the left, description card on the right.
 */
export function ProjectCard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.3"],
  });
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const sectionY = useTransform(scrollYProgress, [0, 0.6], [80, 0]);

  return (
    <section id="projects" ref={sectionRef} className="relative pt-32 pb-16 w-full overflow-hidden">
      <motion.div
        style={{ opacity: sectionOpacity, y: sectionY }}
        className="flex flex-col items-center text-center space-y-4 mb-16 px-4 sm:px-6 lg:px-12"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">
          Featured Work
        </h2>
        <p className="max-w-2xl text-muted-foreground text-lg lg:text-xl">
          Projects showcasing robust testing frameworks and modern full-stack
          web architectures.
        </p>
      </motion.div>

      {/* Project Info Card — connected to center line */}
      <div className="px-4 sm:px-6 lg:px-12">
        <ConnectedCard side="right">
          <div className="group relative rounded-[2rem] border border-white/[0.06] bg-card p-6 md:p-10 shadow-[0_0_80px_-20px_rgba(255,255,255,0.05)]">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary/10 via-transparent to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-center gap-10">
              {/* iPhone live preview — left side on desktop */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="flex-shrink-0"
              >
                <IPhoneFrame>
                  {/* Live mobile iframe — 375×792 scaled to fill 270×570 screen */}
                  <div
                    style={{
                      width: "375px",
                      height: "792px",
                      transform: "scale(0.72)",
                      transformOrigin: "top left",
                    }}
                  >
                    <iframe
                      src="https://www.vyon.in"
                      title="VYON Studios — Mobile Preview"
                      className="border-0"
                      style={{ width: "100%", height: "100%", colorScheme: "only dark" }}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    />
                  </div>
                </IPhoneFrame>
              </motion.div>

              {/* Description — right side on desktop */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 flex-1 min-w-0">
                <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-400 px-4 py-1.5 rounded-full text-sm font-semibold border border-amber-500/20 shadow-inner">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>Live Deployment</span>
                </div>

                <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  VYON E-Commerce
                </h3>

                <p className="text-muted-foreground leading-relaxed text-base lg:text-lg max-w-2xl">
                  A production-ready premium fashion store built end-to-end in under
                  one week. Leveraged Next.js, React, and PostgreSQL, accelerated by
                  GitHub Copilot and Claude Code to compress weeks of development
                  into days.
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                  {[
                    "Next.js",
                    "React",
                    "PostgreSQL",
                    "Cloudinary",
                    "Razorpay",
                    "Vercel",
                  ].map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                      className="bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2 rounded-xl text-sm font-medium border border-white/[0.08] transition-colors backdrop-blur-md"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>

                <div className="pt-4">
                  <a
                    href="https://vyon.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-[1.5rem] font-bold hover:scale-105 transition-transform shadow-[0_0_20px_-5px_rgba(217,119,6,0.4)]"
                  >
                    Visit Live Site <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ConnectedCard>
      </div>
    </section>
  );
}

/**
 * MacbookScroll preview — standalone, NOT inside a ScrollLine.
 * The center line stops before this and resumes after.
 */
export function MacbookPreview() {
  return (
    <div className="w-full overflow-hidden">
      <MacbookScroll
        showGradient={false}
        title={
          <span className="text-white">
            Built in <span className="text-amber-400">under a week</span> — powered by AI
          </span>
        }
        badge={
          <a
            href="https://vyon.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-amber-500/30 transition-colors"
          >
            vyon.in <ExternalLink className="w-3 h-3" />
          </a>
        }
        screenContent={
          <div className="relative w-full h-full bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vyon-real.png"
              alt="VYON Studios — Fallback"
              className="absolute inset-0 w-full h-full object-cover object-left-top"
            />
            <div
              className="absolute inset-0 z-10"
              style={{
                width: "1440px",
                height: "1080px",
                transform: "scale(0.3556)",
                transformOrigin: "top left",
              }}
            >
              <iframe
                src="https://www.vyon.in"
                title="VYON Studios — Live Preview"
                className="border-0"
                style={{
                  width: "100%",
                  height: "100%",
                  colorScheme: "only dark",
                }}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
