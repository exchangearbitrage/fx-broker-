import type { CSSProperties } from "react";
import type { BrandConfig } from "@/config/brand.schema";

function hexToRgbTuple(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

export function buildThemeStyle(theme: BrandConfig["theme"]): CSSProperties {
  return {
    "--color-primary": hexToRgbTuple(theme.primary),
    "--color-secondary": hexToRgbTuple(theme.secondary),
    "--color-accent": hexToRgbTuple(theme.accent),
    "--color-background": hexToRgbTuple(theme.background),
    "--color-surface": hexToRgbTuple(theme.surface),
    "--color-text": hexToRgbTuple(theme.text),
    "--color-success": hexToRgbTuple(theme.success),
    "--color-danger": hexToRgbTuple(theme.danger),
    "--font-heading": theme.fontHeading,
    "--font-body": theme.fontBody,
    "--radius-brand": theme.borderRadius,
  } as CSSProperties;
}
