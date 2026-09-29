export const HEADING_FONTS = ["Libre Baskerville", "Cormorant Garamond", "Playfair Display"] as const;

export const BODY_FONTS = ["Source Serif 4", "Lora", "Nunito Sans"] as const;

export const SCRIPT_FONTS = ["Great Vibes", "Allura", "Italianno"] as const;

export const ENVELOPE_STYLES = [
  { id: "kraft", label: "Kraft paper" },
  { id: "cream", label: "Cream paper" },
  { id: "sage", label: "Sage paper" },
] as const;

export type EnvelopeStyle = (typeof ENVELOPE_STYLES)[number]["id"];

const FONT_VARIABLES: Record<string, string> = {
  "Libre Baskerville": "var(--font-libre-baskerville), Georgia, serif",
  "Cormorant Garamond": "var(--font-cormorant), Georgia, serif",
  "Playfair Display": "var(--font-playfair), Georgia, serif",
  "Source Serif 4": "var(--font-source-serif), Georgia, serif",
  Lora: "var(--font-lora), Georgia, serif",
  "Nunito Sans": "var(--font-nunito), ui-sans-serif, sans-serif",
  "Great Vibes": "var(--font-great-vibes), cursive",
  Allura: "var(--font-allura), cursive",
  Italianno: "var(--font-italianno), cursive",
};

export function fontFamilyValue(name: string) {
  return FONT_VARIABLES[name] ?? "Georgia, serif";
}

export function isHeadingFont(value: string): value is (typeof HEADING_FONTS)[number] {
  return HEADING_FONTS.some((font) => font === value);
}

export function isBodyFont(value: string): value is (typeof BODY_FONTS)[number] {
  return BODY_FONTS.some((font) => font === value);
}

export function isScriptFont(value: string): value is (typeof SCRIPT_FONTS)[number] {
  return SCRIPT_FONTS.some((font) => font === value);
}

export function isEnvelopeStyle(value: string): value is EnvelopeStyle {
  return ENVELOPE_STYLES.some((style) => style.id === value);
}

export function defaultSealInitials(partnerOneName: string, partnerTwoName: string) {
  const letter = (name: string) => name.trim().match(/[A-Za-z]/)?.[0]?.toUpperCase() ?? "";
  const left = letter(partnerOneName);
  const right = letter(partnerTwoName);
  if (left && right) {
    return `${left}&${right}`;
  }
  return left || right || "W";
}
