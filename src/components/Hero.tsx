"use client";

import { motion, useScroll, useTransform, MotionValue, useSpring, useMotionValueEvent } from "motion/react";
import { IconArrowRight, IconDownload } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

/* ─── Constants ─── */
const TOTAL_FRAMES = 80;
const FRAME_PATH = (i: number) =>
  `/frames/frame_${String(i + 1).padStart(4, "0")}.webp`;

/* ─── Scroll Phase: fades in → holds → fades out ─── */
/* Uses useMotionValueEvent to toggle display on/off at phase boundaries.
   This prevents ghost text from drop-shadow/backdrop-blur compositing
   at near-zero opacity, while keeping transitions perfectly smooth. */
function ScrollPhase({
  children,
  scrollYProgress,
  enter,
  exit,
  startVisible = false,
  align = "center",
}: {
  children: React.ReactNode;
  scrollYProgress: MotionValue<number>;
  enter: [number, number];
  exit: [number, number];
  startVisible?: boolean;
  align?: "center" | "left";
}) {
  /* Small margin so the element mounts slightly before the fade starts,
     preventing any visible pop-in. */
  const MARGIN = 0.02;
  const showStart = startVisible ? 0 : Math.max(enter[0] - MARGIN, 0);
  const showEnd = Math.min(exit[1] + MARGIN, 1);

  const [visible, setVisible] = useState(startVisible);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const shouldShow = v >= showStart && v <= showEnd;
    setVisible(shouldShow);
  });

  const opacity = useTransform(
    scrollYProgress,
    startVisible
      ? [0, exit[0], exit[1]]
      : [enter[0], enter[1], exit[0], exit[1]],
    startVisible
      ? [1, 1, 0]
      : [0, 1, 1, 0]
  );

  /* Center-aligned phases use vertical slide; left-aligned use horizontal slide */
  const x = useTransform(
    scrollYProgress,
    startVisible
      ? [0, exit[0], exit[1]]
      : [enter[0], enter[1], exit[0], exit[1]],
    align === "left"
      ? (startVisible ? [0, 0, -80] : [-80, 0, 0, -80])
      : (startVisible ? [0, 0, 0] : [0, 0, 0, 0])
  );
  const y = useTransform(
    scrollYProgress,
    startVisible
      ? [0, exit[0], exit[1]]
      : [enter[0], enter[1], exit[0], exit[1]],
    align === "center"
      ? (startVisible ? [0, 0, -60] : [60, 0, 0, -60])
      : (startVisible ? [0, 0, 0] : [0, 0, 0, 0])
  );

  if (!visible) return null;

  return (
    <motion.div
      style={{ opacity, x, y, willChange: "transform, opacity" }}
      className={`absolute inset-0 flex flex-col pointer-events-none px-6 md:px-12 lg:px-20 z-10 ${
        align === "left"
          ? "items-start justify-center"
          : "items-center justify-center"
      }`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Scroll Progress Bar: isolated component — own hover state, zero parent re-renders ─── */
function HeroProgressBar({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const [hovered, setHovered] = useState(false);
  const smoothPct = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001,
  });

  /* Use compositor-only transforms: scaleY for fill, translateY for glow */
  const fillScaleY = useTransform(smoothPct, [0, 1], [0, 1]);
  const glowTranslateY = useTransform(smoothPct, [0, 1], [0, 128]); // 128px = h-32

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ opacity: hovered ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3"
    >
      {/* Track */}
      <div className="relative w-[2px] h-32 bg-white/[0.08] rounded-full overflow-hidden">
        {/* Fill — compositor-only scaleY from bottom */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-full rounded-full bg-gradient-to-t from-fuchsia-500/40 via-fuchsia-400/80 to-amber-400 origin-bottom"
          style={{ scaleY: fillScaleY, willChange: "transform" }}
        />
        {/* Glow on the fill tip — compositor-only translateY */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 blur-[4px]"
          style={{ transform: useTransform(glowTranslateY, (v) => `translateX(-50%) translateY(${v}px)`), willChange: "transform" }}
        />
      </div>

      {/* Phase dots — pure motion-value driven, no React state */}
      <div
        className="absolute left-1/2 -translate-x-1/2 h-32 flex flex-col justify-between pointer-events-none"
        style={{ top: 0 }}
      >
        {[0.10, 0.34, 0.58, 0.82].map((pos, i) => (
          <PhaseDot key={i} pos={pos} scrollProgress={smoothPct} />
        ))}
      </div>
    </motion.div>
  );
}
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

/* ─── Canvas Image Sequence Hook ───
   Apple-style scroll scrubber: preloads all frames as Image objects,
   then draws the correct frame on a canvas using cover-fit sizing.
   Zero React re-renders — everything via refs and RAF. */
function useCanvasSequence(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  scrollYProgress: MotionValue<number>,
  totalFrames: number
) {
  const framesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef<boolean[]>(new Array(totalFrames).fill(false));
  const lastFrameIndexRef = useRef<number>(-1);
  const rafIdRef = useRef<number>(0);

  /* Draw a single frame on the canvas with object-fit: cover sizing */
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = framesRef.current[frameIndex];
    if (!img || !loadedRef.current[frameIndex]) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Cover fit: scale image to fill canvas, then center-crop
    const scale = Math.max(cw / iw, ch / ih);
    const sw = cw / scale;
    const sh = ch / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  };

  /* Size canvas to match its CSS pixel dimensions (retina-aware) */
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for perf
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      // Redraw current frame after resize
      if (lastFrameIndexRef.current >= 0) {
        drawFrame(lastFrameIndexRef.current);
      }
    }
  };

  useEffect(() => {
    const frames: HTMLImageElement[] = new Array(totalFrames);
    framesRef.current = frames;

    /* Load a single frame and return a promise */
    const loadFrame = (i: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = FRAME_PATH(i);
        img.onload = () => {
          loadedRef.current[i] = true;
          if (i === 0) {
            resizeCanvas();
            drawFrame(0);
            lastFrameIndexRef.current = 0;
          }
          resolve();
        };
        img.onerror = () => resolve(); // skip broken frames
        frames[i] = img;
      });

    /* Priority load first 5 frames, then batch-load the rest on idle */
    const PRIORITY_COUNT = 5;
    const loadAll = async () => {
      // Phase 1: load frames 0-4 immediately (hero first paint)
      const priority = Array.from({ length: Math.min(PRIORITY_COUNT, totalFrames) }, (_, i) => loadFrame(i));
      await Promise.all(priority);

      // Phase 2: load remaining frames in batches during idle time
      const BATCH_SIZE = 8;
      for (let start = PRIORITY_COUNT; start < totalFrames; start += BATCH_SIZE) {
        await new Promise<void>((resolve) => {
          if ("requestIdleCallback" in window) {
            (window as Window).requestIdleCallback(() => resolve(), { timeout: 200 });
          } else {
            setTimeout(resolve, 16);
          }
        });
        const end = Math.min(start + BATCH_SIZE, totalFrames);
        const batch = Array.from({ length: end - start }, (_, j) => loadFrame(start + j));
        await Promise.all(batch);
      }
    };
    loadAll();

    // Handle resize
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFrames]);

  /* Map scroll progress to frame index and draw — RAF-throttled */
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const frameIndex = Math.min(
      Math.floor(progress * totalFrames),
      totalFrames - 1
    );
    if (frameIndex === lastFrameIndexRef.current) return;
    lastFrameIndexRef.current = frameIndex;

    if (rafIdRef.current) return; // already scheduled
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = 0;
      drawFrame(lastFrameIndexRef.current);
    });
  });
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* Canvas image sequence — replaces video scrubbing */
  useCanvasSequence(canvasRef, scrollYProgress, TOTAL_FRAMES);

  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);
  const indicatorVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.06 ? "hidden" as const : "visible" as const
  );

  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.48, 0.72, 0.92, 1],
    [0.05, 0.05, 0.15, 0.35, 1]
  );

  /* Bottom-edge gradient opacity — ramps up in the final 30% of scroll
     to seamlessly dissolve the hero canvas into the page background */
  const bottomFadeOpacity = useTransform(
    scrollYProgress,
    [0, 0.70, 0.92, 1],
    [0, 0, 0.6, 1]
  );

  /*
    SCROLL TIMELINE — 400vh total (4 screens)
    ─────────────────────────────────────────────
    Phase 1:  0%  ─  18%   "I'm Agniva" (center, visible on load)
    Gap:     18%  ─  26%   (empty, just canvas)
    Phase 2: 26%  ─  42%   "I think in AI" (left-aligned, slides from left)
    Gap:     42%  ─  50%   (empty)
    Phase 3: 50%  ─  66%   "I build what I test" (left-aligned)
    Gap:     66%  ─  74%   (empty)
    Phase 4: 74%  ─  92%   "Let's build something extraordinary" (left-aligned, slides from left)
    Fade:    92%  ─ 100%   (canvas darkens, transition to next section)
  */

  return (
    <div
      id="hero"
      ref={containerRef}
      className="relative w-full bg-background text-foreground"
      style={{ height: "400vh" }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: "translateZ(0)" }}
        />

        {/* Subtle full-screen tint — only darkens heavily at scroll end for section transition */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-background pointer-events-none"
        />
        {/* Bottom gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
        {/* Top edge softener — subtle gradient prevents hard canvas boundary */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-transparent to-transparent pointer-events-none" />
        {/* Bottom edge dissolve — fades canvas into page background as hero ends */}
        <motion.div
          style={{ opacity: bottomFadeOpacity }}
          className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none"
        />
        {/* Soft edge vignette — subtle, no hard seams */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(10,8,6,0.2) 0%, transparent 35%, transparent 90%, rgba(10,8,6,0.08) 100%)" }} />

        {/* ── PHASE 1: Introduction ── visible on load, center, fades out 14-18% */}
        <ScrollPhase
          scrollYProgress={scrollYProgress}
          enter={[0, 0]}
          exit={[0.14, 0.18]}
          startVisible
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center text-center max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-black/40 border border-amber-500/20 px-4 py-2 rounded-full backdrop-blur-md shadow-2xl">
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

        {/* ── PHASE 2: AI Identity ── slides from left 26-30%, holds, exits 38-42% */}
        <ScrollPhase
          scrollYProgress={scrollYProgress}
          enter={[0.26, 0.30]}
          exit={[0.38, 0.42]}
          align="left"
        >
          {/* Blur-feathered dark blob behind text — compact element with massive
              blur() creates perfectly smooth edges with no visible boundary */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "15%",
              left: "-5%",
              width: "55%",
              height: "70%",
              background: "rgba(10,8,6,0.5)",
              filter: "blur(80px)",
              zIndex: 0,
            }}
          />

          <div className="relative flex flex-col items-start text-left max-w-2xl space-y-6" style={{ zIndex: 1 }}>
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-fuchsia-300/90 bg-fuchsia-500/10 border border-fuchsia-500/20 px-5 py-2 rounded-full backdrop-blur-md">
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

        {/* ── PHASE 3: Full-Stack ── slides from left 50-54%, holds, exits 62-66% */}
        <ScrollPhase
          scrollYProgress={scrollYProgress}
          enter={[0.50, 0.54]}
          exit={[0.62, 0.66]}
          align="left"
        >
          {/* Blur-feathered dark blob behind text */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "15%",
              left: "-5%",
              width: "55%",
              height: "70%",
              background: "rgba(10,8,6,0.5)",
              filter: "blur(80px)",
              zIndex: 0,
            }}
          />

          <div className="relative flex flex-col items-start text-left max-w-2xl space-y-6" style={{ zIndex: 1 }}>
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-5 py-2 rounded-full backdrop-blur-md">
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

            <div className="flex flex-wrap justify-start gap-3 pt-2">
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

        {/* ── PHASE 4: Closing CTA ── slides from left 74-78%, holds, exits 88-92% */}
        <ScrollPhase
          scrollYProgress={scrollYProgress}
          enter={[0.74, 0.78]}
          exit={[0.88, 0.92]}
          align="left"
        >
          {/* Blur-feathered dark blob — galaxy frames are busiest here,
              slightly stronger opacity for readability */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "10%",
              left: "-5%",
              width: "55%",
              height: "80%",
              background: "rgba(10,8,6,0.6)",
              filter: "blur(80px)",
              zIndex: 0,
            }}
          />

          <div className="relative flex flex-col items-start text-left max-w-2xl space-y-8" style={{ zIndex: 1 }}>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] drop-shadow-2xl">
              Let&apos;s build something{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-amber-300">
                extraordinary.
              </span>
            </h2>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed font-medium drop-shadow-lg">
              Whether it&apos;s bulletproof test infrastructure, AI-powered workflows,
              or a full-stack product from zero to production — I ship quality, fast.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 pt-4 pointer-events-auto">
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                data-cursor-hint="Explore"
                className="flex items-center gap-2 bg-fuchsia-600 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-[0_0_40px_-5px_rgba(192,38,211,0.6)] hover:scale-105 hover:shadow-[0_0_60px_-10px_rgba(192,38,211,0.8)] transition-all duration-300 backdrop-blur-md"
              >
                View Projects
                <IconArrowRight className="w-5 h-5" />
              </button>

              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hint="Download"
                className="flex items-center gap-2 bg-black/50 text-white border border-fuchsia-400/30 px-8 py-4 rounded-[1.5rem] font-bold hover:bg-fuchsia-500/10 hover:scale-105 transition-all duration-300 backdrop-blur-md shadow-xl"
              >
                <IconDownload className="w-5 h-5" />
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

        {/* Scroll progress bar — extracted component, own hover state */}
        <HeroProgressBar scrollYProgress={scrollYProgress} />

      </div>
    </div>
  );
}
