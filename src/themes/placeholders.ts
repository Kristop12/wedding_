import type { WeddingThemeConfig } from "./types";

export const elegantTheme: WeddingThemeConfig = {
  id: "elegant",
  name: "Elegant",
  colors: {
    primary: "#1F1A17",
    secondary: "#8C8378",
    background: "#FBF8F4",
    surface: "#FFFFFF",
    text: "#1F1A17",
    accent: "#A68B5B",
  },
  typography: {
    heading: "Playfair Display",
    body: "Lora",
    script: "Italianno",
  },
  invitation: {
    envelopeStyle: "cream",
    cardStyle: "formal",
    sealStyle: "wax",
    animation: "unveil",
  },
  sectionStyle: {
    spacing: "4rem",
    borderRadius: "0.5rem",
  },
};

export const modernTheme: WeddingThemeConfig = {
  id: "modern",
  name: "Modern",
  colors: {
    primary: "#18181B",
    secondary: "#71717A",
    background: "#F4F4F5",
    surface: "#FFFFFF",
    text: "#18181B",
    accent: "#3F3F46",
  },
  typography: {
    heading: "Cormorant Garamond",
    body: "Nunito Sans",
    script: "Allura",
  },
  invitation: {
    envelopeStyle: "cream",
    cardStyle: "plain",
    sealStyle: "none",
    animation: "split",
  },
  sectionStyle: {
    spacing: "3.5rem",
    borderRadius: "0.75rem",
  },
};

export const tropicalTheme: WeddingThemeConfig = {
  id: "tropical",
  name: "Tropical",
  colors: {
    primary: "#2F6F4E",
    secondary: "#E7C89A",
    background: "#FFF8F0",
    surface: "#FFFFFF",
    text: "#243028",
    accent: "#D4765A",
  },
  typography: {
    heading: "Cormorant Garamond",
    body: "Lora",
    script: "Great Vibes",
  },
  invitation: {
    envelopeStyle: "sage",
    cardStyle: "garden",
    sealStyle: "wax",
    animation: "bloom",
  },
  sectionStyle: {
    spacing: "4rem",
    borderRadius: "1.5rem",
  },
};
