import { z } from "zod";
import { getThemeConfig } from "./registry";
import {
  isBodyFont,
  isEnvelopeStyle,
  isHeadingFont,
  isScriptFont,
} from "./options";
import type { ThemeSettingsRecord, WeddingThemeConfig } from "./types";

const hexColor = /^#[0-9A-Fa-f]{6}$/;

const customConfigSchema = z.object({
  envelopeStyle: z.string().optional(),
  sealInitials: z.string().optional(),
  musicEnabled: z.boolean().optional(),
  musicUrl: z.string().optional(),
});

function audioUrl(value: string | undefined) {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && /\.(mp3|m4a)$/i.test(url.pathname)) {
      return value;
    }
  } catch {
    return null;
  }
  return null;
}

export function readCustomConfig(value: unknown) {
  const parsed = customConfigSchema.safeParse(value ?? {});
  if (!parsed.success) {
    return { envelopeStyle: undefined, sealInitials: undefined, musicEnabled: false, musicUrl: null };
  }

  const envelopeStyle = parsed.data.envelopeStyle;
  const sealInitials = parsed.data.sealInitials?.trim();

  return {
    envelopeStyle: envelopeStyle && isEnvelopeStyle(envelopeStyle) ? envelopeStyle : undefined,
    sealInitials: sealInitials ? sealInitials.slice(0, 8) : undefined,
    musicEnabled: parsed.data.musicEnabled === true,
    musicUrl: audioUrl(parsed.data.musicUrl?.trim()),
  };
}

function validHex(value: string | null | undefined) {
  return value && hexColor.test(value) ? value : null;
}

export function resolveTheme(
  themeId: string,
  settings: ThemeSettingsRecord | null,
): WeddingThemeConfig {
  const base = getThemeConfig(themeId);
  const custom = readCustomConfig(settings?.customConfigJson);
  const heading = settings?.headingFont;
  const body = settings?.bodyFont;
  const script = settings?.scriptFont;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: validHex(settings?.primaryColor) ?? base.colors.primary,
      accent: validHex(settings?.accentColor) ?? base.colors.accent,
    },
    typography: {
      heading: heading && isHeadingFont(heading) ? heading : base.typography.heading,
      body: body && isBodyFont(body) ? body : base.typography.body,
      script: script && isScriptFont(script) ? script : base.typography.script,
    },
    invitation: {
      ...base.invitation,
      envelopeStyle: custom.envelopeStyle ?? base.invitation.envelopeStyle,
    },
  };
}

export function themePalette(config: WeddingThemeConfig) {
  return {
    primaryColor: config.colors.primary,
    secondaryColor: config.colors.secondary,
    backgroundColor: config.colors.background,
    textColor: config.colors.text,
    accentColor: config.colors.accent,
    headingFont: config.typography.heading,
    bodyFont: config.typography.body,
    scriptFont: config.typography.script,
  };
}
