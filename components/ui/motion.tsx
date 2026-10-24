"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

type ScrollRevealProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
};

export function ScrollReveal({ children, delay = 0, direction = "up", distance = 24, className, ...props }: ScrollRevealProps) {
  const directions = {
    up: { y: distance }, down: { y: -distance }, left: { x: distance }, right: { x: -distance }, none: { x: 0, y: 0 },
  };

  return <motion.div {...props} initial={{ opacity: 0, ...directions[direction] }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.7, delay, ease: LUXURY_EASE }} className={className}>{children}</motion.div>;
}

type StaggerContainerProps = HTMLMotionProps<"div"> & { children: ReactNode; staggerDelay?: number; delayChildren?: number };

export function StaggerContainer({ children, staggerDelay = 0.1, delayChildren = 0.05, className, ...props }: StaggerContainerProps) {
  const variants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: staggerDelay, delayChildren } } };
  return <motion.div {...props} variants={variants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className={className}>{children}</motion.div>;
}

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<"div"> & { children: ReactNode }) {
  const variants: Variants = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: LUXURY_EASE } } };
  return <motion.div {...props} variants={variants} className={className}>{children}</motion.div>;
}

type HoverLiftProps = HTMLMotionProps<"div"> & { children: ReactNode; liftDistance?: number; scale?: number };

export function HoverLift({ children, liftDistance = -6, scale = 1.01, className, ...props }: HoverLiftProps) {
  return <motion.div {...props} whileHover={{ y: liftDistance, scale, transition: { type: "spring", stiffness: 360, damping: 24 } }} whileTap={{ scale: 0.98 }} className={className}>{children}</motion.div>;
}

type SmoothCounterProps = { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string; format?: (value: number) => string };

export function SmoothCounter({ value, prefix = "", suffix = "", decimals = 0, className, format }: SmoothCounterProps) {
  const source = useMotionValue(value);
  const spring = useSpring(source, { stiffness: 80, damping: 18, mass: 0.6 });
  const [displayed, setDisplayed] = useState(value);
  useEffect(() => { source.set(value); }, [source, value]);
  useMotionValueEvent(spring, "change", (latest) => setDisplayed(latest));
  const text = format ? format(displayed) : displayed.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span className={className} aria-live="polite">{prefix}{text}{suffix}</span>;
}
