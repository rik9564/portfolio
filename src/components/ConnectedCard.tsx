"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/**
 * A card that connects to the central dashed timeline line.
 *
 * Desktop (md+): 3-column grid — [left half | node | right half]
 *   Left card:   card slides in from the left → branch draws → node pops
 *   Right card:  node pops → branch draws → card slides in from the right
 *
 * Mobile: line on left side, all cards slide in from right
 *
 * All animations are scroll-driven — cards come from far off-screen.
 */

export function ConnectedCard({
  children,
  side = "left",
  nodeIcon,
}: {
  children: React.ReactNode;
  side?: "left" | "right";
  nodeIcon?: React.ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "center 0.6"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    restDelta: 0.001,
  });

  // Card slides in from far off-screen
  const cardXLeft = useTransform(smooth, [0, 0.7], [-120, 0]);
  const cardXRight = useTransform(smooth, [0, 0.7], [120, 0]);
  const cardOpacity = useTransform(smooth, [0, 0.35], [0, 1]);
  const cardRotateLeft = useTransform(smooth, [0, 0.7], [-3, 0]);
  const cardRotateRight = useTransform(smooth, [0, 0.7], [3, 0]);

  // Node pops in at the center line
  const nodeScale = useTransform(smooth, [0.15, 0.45], [0, 1]);
  const nodeGlow = useTransform(
    smooth,
    [0.15, 0.4, 0.7],
    [
      "0 0 0px 0px hsl(36, 95%, 55%, 0)",
      "0 0 20px 6px hsl(36, 95%, 55%, 0.5)",
      "0 0 15px 3px hsl(36, 95%, 55%, 0.3)",
    ]
  );

  // Branch draws from node toward card
  const branchScale = useTransform(smooth, [0.25, 0.55], [0, 1]);
  const branchOpacity = useTransform(smooth, [0.2, 0.4], [0, 1]);

  // Mobile: always slides from right
  const mobileCardX = useTransform(smooth, [0, 0.7], [60, 0]);

  const isLeft = side === "left";
  const cardX = isLeft ? cardXLeft : cardXRight;
  const cardRotate = isLeft ? cardRotateLeft : cardRotateRight;

  return (
    <div ref={rowRef} className="relative">
      {/* ── Desktop layout: 3-column grid ── */}
      <div className="hidden md:grid md:grid-cols-[1fr_44px_1fr] md:items-center">
        {/* Col 1: left side */}
        <div className={`flex items-center ${isLeft ? "justify-end" : ""}`}>
          {isLeft && (
            <>
              <motion.div
                style={{
                  opacity: cardOpacity,
                  x: cardX,
                  rotate: cardRotate,
                }}
                className="flex-1 min-w-0 pr-2"
              >
                {children}
              </motion.div>
              <motion.div
                style={{ scaleX: branchScale, opacity: branchOpacity }}
                className="w-12 h-px shrink-0 origin-right"
              >
                <div className="w-full h-full border-t-[1.5px] border-dashed border-primary/50" />
              </motion.div>
            </>
          )}
        </div>

        {/* Col 2: center node */}
        <div className="flex justify-center">
          <motion.div
            style={{ scale: nodeScale, boxShadow: nodeGlow }}
            className="relative z-10 flex items-center justify-center w-11 h-11 rounded-full border-[3px] border-background bg-primary/90 text-primary-foreground"
          >
            {nodeIcon || (
              <div className="w-2 h-2 rounded-full bg-primary-foreground/80" />
            )}
          </motion.div>
        </div>

        {/* Col 3: right side */}
        <div className={`flex items-center ${!isLeft ? "justify-start" : ""}`}>
          {!isLeft && (
            <>
              <motion.div
                style={{ scaleX: branchScale, opacity: branchOpacity }}
                className="w-12 h-px shrink-0 origin-left"
              >
                <div className="w-full h-full border-t-[1.5px] border-dashed border-primary/50" />
              </motion.div>
              <motion.div
                style={{
                  opacity: cardOpacity,
                  x: cardX,
                  rotate: cardRotate,
                }}
                className="flex-1 min-w-0 pl-2"
              >
                {children}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile layout: node on left + branch + card ── */}
      <div className="flex items-center md:hidden">
        <motion.div
          style={{ scale: nodeScale, boxShadow: nodeGlow }}
          className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-background bg-primary/90 text-primary-foreground shrink-0"
        >
          {nodeIcon || (
            <div className="w-2 h-2 rounded-full bg-primary-foreground/80" />
          )}
        </motion.div>
        <motion.div
          style={{ scaleX: branchScale, opacity: branchOpacity }}
          className="w-6 h-px shrink-0 origin-left"
        >
          <div className="w-full h-full border-t-[1.5px] border-dashed border-primary/50" />
        </motion.div>
        <motion.div
          style={{
            opacity: cardOpacity,
            x: mobileCardX,
          }}
          className="flex-1 min-w-0"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
