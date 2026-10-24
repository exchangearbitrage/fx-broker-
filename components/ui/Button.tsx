import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-brand text-sm font-semibold transition-[background-color,color,box-shadow,opacity,scale] duration-150 ease-out active:not-disabled:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-brand-primary px-4 py-2.5 text-black hover:opacity-90",
  secondary: "bg-brand-surface px-4 py-2.5 text-brand-text shadow-border hover:shadow-border-hover",
  ghost: "px-3.5 py-2.5 text-brand-secondary hover:bg-white/5 hover:text-brand-text",
  danger: "bg-brand-danger px-4 py-2.5 text-white hover:opacity-90",
};

type Variant = keyof typeof variants;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  staticPress?: boolean;
};

export function Button({ className, variant = "primary", staticPress, ...props }: ButtonProps) {
  return <button className={cn(base, staticPress && "active:scale-100", variants[variant], className)} {...props} />;
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: Variant;
};

export function LinkButton({ className, variant = "primary", ...props }: LinkButtonProps) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
}
