"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
  IconCode,
  IconBriefcase,
  IconRocket,
  IconBrandLinkedin,
  IconBrandGithub,
} from "@tabler/icons-react";

const links = [
  {
    title: "Home",
    icon: <IconHome className="h-full w-full" style={{ color: "hsl(36, 60%, 65%)" }} />,
    href: "#hero",
  },
  {
    title: "Skills",
    icon: <IconCode className="h-full w-full" style={{ color: "hsl(36, 60%, 65%)" }} />,
    href: "#skills",
  },
  {
    title: "Projects",
    icon: <IconRocket className="h-full w-full" style={{ color: "hsl(36, 60%, 65%)" }} />,
    href: "#projects",
  },
  {
    title: "Experience",
    icon: <IconBriefcase className="h-full w-full" style={{ color: "hsl(36, 60%, 65%)" }} />,
    href: "#experience",
  },
  {
    title: "LinkedIn",
    icon: <IconBrandLinkedin className="h-full w-full" style={{ color: "hsl(36, 60%, 65%)" }} />,
    href: "https://www.linkedin.com/in/agniva-chowdhury-840a7b18b/",
  },
  {
    title: "GitHub",
    icon: <IconBrandGithub className="h-full w-full" style={{ color: "hsl(36, 60%, 65%)" }} />,
    href: "https://github.com/rik9564",
  },
];

export function FloatingNav() {
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    heroRef.current = document.getElementById("hero");
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Show dock once the hero section has been fully scrolled past
    setVisible(v >= 0.95);
  });

  return (
    <motion.div
      className="fixed bottom-6 inset-x-0 z-50 flex justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <FloatingDock items={links} />
    </motion.div>
  );
}
