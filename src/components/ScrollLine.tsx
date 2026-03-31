"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/**
 * A continuous dashed vertical line down the center of the page.
 * Reveals itself top-to-bottom as the user scrolls, with a glowing
 * leading edge that travels downward.
 *
 * Wrap this around the sections it should span.
 */

export function ScrollLine({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.0005,
  });

  // Clip path: reveal line from top to bottom
  const lineClip = useTransform(
    smooth,
    (v: number) => `inset(0 0 ${(1 - v) * 100}% 0)`
  );

  // Glow dot tracks the leading edge
  const glowTop = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const glowOpacity = useTransform(smooth, [0, 0.02, 0.93, 1], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative">
      {/* ── Dashed line (clipped to reveal on scroll) ── */}
      <motion.div
        className="absolute left-5 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px pointer-events-none z-[1]"
        style={{
          clipPath: lineClip,
          backgroundImage:
            "repeating-linear-gradient(to bottom, hsl(36, 95%, 55%, 0.5) 0px, hsl(36, 95%, 55%, 0.5) 6px, transparent 6px, transparent 14px)",
        }}
      />

      {/* ── Soft glow trail behind the revealed line ── */}
      <motion.div
        className="absolute left-[18px] md:left-1/2 md:-translate-x-[3px] w-[6px] top-0 bottom-0 pointer-events-none z-[0]"
        style={{
          clipPath: lineClip,
          background:
            "linear-gradient(to bottom, hsl(36, 95%, 55%, 0) 0%, hsl(36, 95%, 55%, 0.1) 30%, hsl(330, 80%, 60%, 0.06) 50%, hsl(36, 95%, 55%, 0.1) 70%, hsl(36, 95%, 55%, 0) 100%)",
          filter: "blur(4px)",
        }}
      />

      {/* ── Glowing dot at the leading edge ── */}
      <motion.div
        className="absolute left-5 md:left-1/2 pointer-events-none z-[2]"
        style={{
          top: glowTop,
          opacity: glowOpacity,
          transform: "translate(-50%, -50%)",
          width: 12,
          height: 12,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, hsl(36, 95%, 65%) 0%, hsl(36, 95%, 55%, 0.5) 50%, transparent 70%)",
          boxShadow:
            "0 0 16px 4px hsl(36, 95%, 55%, 0.5), 0 0 40px 10px hsl(36, 95%, 55%, 0.15)",
        }}
      />

      {children}
    </div>
  );
}
