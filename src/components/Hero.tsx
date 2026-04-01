"use client";

import { motion, useScroll, useTransform, MotionValue, useSpring } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useMotionValueEvent } from "framer-motion";

/* ─── Scroll Phase: fades in → holds → fades out ─── */
/* Pure motion-value driven — NO React state re-renders */
function ScrollPhase({
  children,
  scrollYProgress,
  enter,
  exit,
  startVisible = false,
}: {
  children: React.ReactNode;
  scrollYProgress: MotionValue<number>;
  enter: [number, number];
  exit: [number, number];
  startVisible?: boolean;
}) {
  const opacity = useTransform(
    scrollYProgress,
    startVisible
      ? [0, exit[0], exit[1]]
      : [enter[0], enter[1], exit[0], exit[1]],
    startVisible
      ? [1, 1, 0]
      : [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    startVisible
      ? [0, exit[0], exit[1]]
      : [enter[0], enter[1], exit[0], exit[1]],
    startVisible
      ? [0, 0, -60]
      : [60, 0, 0, -60]
  );

  return (
    <motion.div
      style={{ opacity, y, willChange: "transform, opacity" }}
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 z-10"
    >
      {children}
    </motion.div>
  );
}

/* ─── Phase Dot: scroll-driven, zero re-renders ─── */
function PhaseDot({
  pos,
  scrollProgress,
}: {
  pos: number;
  scrollProgress: MotionValue<number>;
}) {
  const threshold = pos - 0.05;
  const borderColor = useTransform(scrollProgress, (v) =>
    v >= threshold ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)"
  );
  const backgroundColor = useTransform(scrollProgress, (v) =>
    v >= threshold ? "rgba(255,255,255,0.3)" : "transparent"
  );

  return (
    <motion.div
      className="w-[6px] h-[6px] rounded-full"
      style={{
        position: "absolute",
        top: `${pos * 100}%`,
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor,
        backgroundColor,
      }}
    />
  );
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoReadyRef = useRef(false);
  const rafIdRef = useRef<number>(0);
  const targetTimeRef = useRef<number>(0);
  const lastSetTimeRef = useRef<number>(-1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);
  const indicatorVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.06 ? "hidden" as const : "visible" as const
  );

  const overlayOpacity = useTransform(scrollYProgress, [0.92, 1], [0.05, 0.85]);

  /* ── High-performance video scrubbing ──
     Uses requestAnimationFrame to coalesce scroll events into a single
     seek per paint frame. Only seeks when the target actually changed
     by a meaningful amount (> 0.01s) to avoid redundant decodes. */
  const scheduleSeek = useCallback(() => {
    if (rafIdRef.current) return; // already scheduled
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = 0;
      const video = videoRef.current;
      if (!video || !videoReadyRef.current) return;
      const target = targetTimeRef.current;
      // Only seek if change is meaningful (avoids micro-stutters)
      if (Math.abs(target - lastSetTimeRef.current) > 0.01) {
        lastSetTimeRef.current = target;
        video.currentTime = target;
      }
    });
  }, []);

  /* Seek video to scroll position — RAF-throttled */
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;
    targetTimeRef.current = progress * video.duration;
    scheduleSeek();
  });

  /* Set up video: pause, seek to 0 */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => {
      videoReadyRef.current = true;
      video.pause();
      video.currentTime = 0;
    };

    video.addEventListener("loadedmetadata", onReady);

    // If metadata is already loaded (cached), trigger immediately
    if (video.readyState >= 1) {
      onReady();
    }

    return () => {
      video.removeEventListener("loadedmetadata", onReady);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  /*
    SCROLL TIMELINE — 400vh total (4 screens)
    ─────────────────────────────────────────────
    Phase 1:  0%  ─  20%   "I'm Agniva" (visible on load)
    Gap:     20%  ─  24%   (brief empty, just video)
    Phase 2: 24%  ─  44%   "I think in AI"
    Gap:     44%  ─  48%   (brief empty)
    Phase 3: 48%  ─  68%   "I build what I test"
    Gap:     68%  ─  72%   (brief empty)
    Phase 4: 72%  ─  92%   "Let's build something extraordinary"
    Fade:    92%  ─ 100%   (video darkens, transition to next section)
  */

  const [heroHovered, setHeroHovered] = useState(false);

  /* Scroll-driven progress for phase dots — motion value, no React state */
  const smoothScrollPct = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <div
      id="hero"
      ref={containerRef}
      className="relative w-full bg-background text-foreground"
      style={{ height: "400vh" }}
      onMouseEnter={() => setHeroHovered(true)}
      onMouseLeave={() => setHeroHovered(false)}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <video
          ref={videoRef}
          src="/hero.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: "contents", transform: "translateZ(0)" }}
        />

        {/* Subtle full-screen tint — only darkens heavily at scroll end for section transition */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-background pointer-events-none"
        />
        {/* Bottom gradient for text readability — only lower third */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />
        {/* Subtle side vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/15 via-transparent to-background/15 pointer-events-none" />

        {/* ── PHASE 1: Introduction ── visible on load, holds, fades out 16-20% */}
        {/* Video: warm amber/orange rim light on dark purple background */}
        <ScrollPhase
          scrollYProgress={scrollYProgress}
          enter={[0, 0]}
          exit={[0.16, 0.20]}
          startVisible
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[600px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-0 left-1/4 w-[50vw] max-w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center text-center max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-black/40 border border-amber-500/20 px-4 py-2 rounded-full backdrop-blur-xl shadow-2xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-sm font-bold tracking-widest uppercase text-white/90">Available for work</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.1] drop-shadow-2xl">
              I&apos;m Agniva.
            </h1>

            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
              QA Automation Engineer
            </p>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed font-medium drop-shadow-lg">
              I break software before users do. 4+ years building test frameworks
              that catch what humans miss.
            </p>
          </motion.div>
        </ScrollPhase>

        {/* ── PHASE 2: AI Identity ── fades in 24-28%, holds, fades out 40-44% */}
        {/* Video: transitioning into space — purple/magenta sky emerging */}
        <ScrollPhase
          scrollYProgress={scrollYProgress}
          enter={[0.24, 0.28]}
          exit={[0.40, 0.44]}
        >
          <div className="absolute top-1/3 right-1/4 w-[60vw] max-w-[600px] h-[500px] bg-fuchsia-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

          <div className="relative flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-fuchsia-300/90 bg-fuchsia-500/10 border border-fuchsia-500/20 px-5 py-2 rounded-full backdrop-blur-xl">
              Beyond Automation
            </span>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] drop-shadow-2xl">
              I think in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300">
                AI.
              </span>
            </h2>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed font-medium drop-shadow-lg">
              Copilot, Claude, Gemini — these aren&apos;t just tools to me.
              I prompt-engineer my way through complex problems, generate entire test suites
              with AI, and build intelligent workflows that make teams 10x faster.
            </p>

            <p className="text-base md:text-lg text-white/50 max-w-xl italic">
              &quot;AI won&apos;t replace engineers. Engineers who use AI will.&quot;
            </p>
          </div>
        </ScrollPhase>

        {/* ── PHASE 3: Full-Stack ── fades in 48-52%, holds, fades out 64-68% */}
        {/* Video: deep space — purple sky, golden nebula highlights */}
        <ScrollPhase
          scrollYProgress={scrollYProgress}
          enter={[0.48, 0.52]}
          exit={[0.64, 0.68]}
        >
          <div className="absolute bottom-1/4 left-1/3 w-[60vw] max-w-[600px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

          <div className="relative flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-5 py-2 rounded-full backdrop-blur-xl">
              Full-Stack Developer
            </span>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] drop-shadow-2xl">
              I build what{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                I test.
              </span>
            </h2>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed font-medium drop-shadow-lg">
              Next.js, React, PostgreSQL, Vercel — I shipped a production
              e-commerce platform in under a week. Testing taught me what
              great software looks like. Now I build it too.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {["Next.js", "React", "Node.js", "PostgreSQL", "TypeScript", "Vercel"].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-white/[0.05] border border-amber-500/[0.15] rounded-xl text-sm font-semibold text-amber-100/60 backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </ScrollPhase>

        {/* ── PHASE 4: Closing CTA ── fades in 72-76%, holds, fades out 88-92% */}
        {/* Video: full cosmic — vivid magenta/purple nebula with golden accents */}
        <ScrollPhase
          scrollYProgress={scrollYProgress}
          enter={[0.72, 0.76]}
          exit={[0.88, 0.92]}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[700px] h-[500px] bg-fuchsia-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

          <div className="relative flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] drop-shadow-2xl">
              Let&apos;s build something{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-amber-300">
                extraordinary.
              </span>
            </h2>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed font-medium drop-shadow-lg">
              Whether it&apos;s bulletproof test infrastructure, AI-powered workflows,
              or a full-stack product from zero to production — I ship quality, fast.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 pointer-events-auto">
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                data-cursor-hint="Explore"
                className="flex items-center gap-2 bg-fuchsia-600 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-[0_0_40px_-5px_rgba(192,38,211,0.6)] hover:scale-105 hover:shadow-[0_0_60px_-10px_rgba(192,38,211,0.8)] transition-all duration-300 backdrop-blur-md"
              >
                View Projects
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hint="Download"
                className="flex items-center gap-2 bg-black/40 text-white border border-fuchsia-400/30 px-8 py-4 rounded-[1.5rem] font-bold hover:bg-fuchsia-500/10 hover:scale-105 transition-all duration-300 backdrop-blur-xl shadow-xl"
              >
                <Download className="w-5 h-5" />
                Resume
              </a>
            </div>
          </div>
        </ScrollPhase>

        {/* Scroll Indicator — minimal line + dot */}
        <motion.div
          style={{ opacity: indicatorOpacity, visibility: indicatorVisibility }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/40 mb-3">
            Scroll
          </span>
          <div className="relative w-[1px] h-12 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-white/60 to-transparent rounded-full"
            />
          </div>
        </motion.div>

        {/* Scroll progress bar — right edge, only visible on hover */}
        <motion.div
          animate={{ opacity: heroHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3"
        >
          {/* Track */}
          <div className="relative w-[2px] h-32 bg-white/[0.08] rounded-full overflow-hidden">
            {/* Fill */}
            <motion.div
              className="absolute top-0 left-0 w-full rounded-full bg-gradient-to-b from-amber-400 via-fuchsia-400/80 to-fuchsia-500/40"
              style={{ height: useTransform(smoothScrollPct, [0, 1], ["0%", "100%"]), willChange: "height" }}
            />
            {/* Glow on the fill tip */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 blur-[4px]"
              style={{ top: useTransform(smoothScrollPct, [0, 1], ["0%", "100%"]), willChange: "top" }}
            />
          </div>

          {/* Phase dots — pure motion-value driven, no React state */}
          <div className="absolute left-1/2 -translate-x-1/2 h-32 flex flex-col justify-between pointer-events-none"
            style={{ top: 0 }}
          >
            {[0.10, 0.34, 0.58, 0.82].map((pos, i) => (
              <PhaseDot key={i} pos={pos} scrollProgress={smoothScrollPct} />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
