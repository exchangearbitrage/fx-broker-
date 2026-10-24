import type { SVGProps } from "react";

type GlyphProps = SVGProps<SVGSVGElement>;

function Glyph({ children, ...props }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function ActionArrowGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M6 12h11" />
      <path d="M13 7l5 5-5 5" />
    </Glyph>
  );
}

export function MarketGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M4 17l4.3-5 3.7 3.4L19.5 7" />
      <path d="M4 20h16" />
      <path d="M4 4v16" />
    </Glyph>
  );
}

export function TradeGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M5 7h9" />
      <path d="M10 3l4 4-4 4" />
      <path d="M19 17h-9" />
      <path d="M14 13l-4 4 4 4" />
    </Glyph>
  );
}

export function CopyGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="16" r="3" />
      <path d="M10.5 10.5l3 3" />
      <path d="M16 7v4" />
      <path d="M14 9h4" />
    </Glyph>
  );
}

export function AutomationGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M7 8a5 5 0 0 1 9.4-2.4" />
      <path d="M17 4v4h-4" />
      <path d="M17 16a5 5 0 0 1-9.4 2.4" />
      <path d="M7 20v-4h4" />
      <circle cx="12" cy="12" r="1.8" />
    </Glyph>
  );
}

export function EducationGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M5 6.5h7a4 4 0 0 1 4 4v7H9a4 4 0 0 1-4-4v-7Z" />
      <path d="M12 6.5v11" />
      <path d="M16 8h3v10h-3" />
    </Glyph>
  );
}

export function TrustGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M12 3l7 3v5c0 4.4-2.8 7.7-7 10-4.2-2.3-7-5.6-7-10V6l7-3Z" />
      <path d="M8.8 12.2l2.1 2.1 4.4-4.8" />
    </Glyph>
  );
}

export function MenuGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h14" />
    </Glyph>
  );
}

export function CloseGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M7 7l10 10" />
      <path d="M17 7L7 17" />
    </Glyph>
  );
}

export function SunGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2" />
      <path d="M12 18.5v2" />
      <path d="M3.5 12h2" />
      <path d="M18.5 12h2" />
      <path d="M6 6l1.4 1.4" />
      <path d="M16.6 16.6L18 18" />
      <path d="M18 6l-1.4 1.4" />
      <path d="M7.4 16.6L6 18" />
    </Glyph>
  );
}

export function MoonGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M18.7 14.3A7 7 0 0 1 9.7 5.3 7.5 7.5 0 1 0 18.7 14.3Z" />
    </Glyph>
  );
}
