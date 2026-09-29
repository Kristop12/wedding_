import { WEDDING_THEMES, type WeddingThemeId } from "@/lib/weddings/constants";
import { elegantTheme, modernTheme, tropicalTheme } from "./placeholders";
import { rusticTheme } from "./rustic/config";
import type { WeddingThemeConfig } from "./types";

const THEME_CONFIGS: Record<WeddingThemeId, WeddingThemeConfig> = {
  rustic: rusticTheme,
  elegant: elegantTheme,
  modern: modernTheme,
  tropical: tropicalTheme,
};

export function isThemeId(value: string | undefined): value is WeddingThemeId {
  return WEDDING_THEMES.some((theme) => theme.id === value);
}

export function getThemeConfig(themeId: string): WeddingThemeConfig {
  if (isThemeId(themeId)) {
    return THEME_CONFIGS[themeId];
  }
  return rusticTheme;
}
