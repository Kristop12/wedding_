import type { CSSProperties, ReactNode } from "react";
import { fontFamilyValue } from "./options";
import type { ThemeViewModel } from "./types";

export function ThemeFrame({
  model,
  className,
  children,
}: {
  model: ThemeViewModel;
  className?: string;
  children: ReactNode;
}) {
  const { colors, typography, sectionStyle } = model.config;
  const style = {
    "--theme-primary": colors.primary,
    "--theme-secondary": colors.secondary,
    "--theme-bg": colors.background,
    "--theme-surface": colors.surface,
    "--theme-text": colors.text,
    "--theme-accent": colors.accent,
    "--theme-heading": fontFamilyValue(typography.heading),
    "--theme-body": fontFamilyValue(typography.body),
    "--theme-script": fontFamilyValue(typography.script),
    "--theme-radius": sectionStyle.borderRadius,
    backgroundColor: "var(--theme-bg)",
    color: "var(--theme-text)",
    fontFamily: "var(--theme-body)",
  } as CSSProperties;

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
