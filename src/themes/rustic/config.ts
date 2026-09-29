import type { WeddingThemeConfig } from "../types";

export const rusticTheme: WeddingThemeConfig = {
  id: "rustic",
  name: "Rustic",
  colors: {
    primary: "#B86F52",
    secondary: "#87957A",
    background: "#F7F1E8",
    surface: "#FFFDF9",
    text: "#332D29",
    accent: "#6F5141",
  },
  typography: {
    heading: "Libre Baskerville",
    body: "Source Serif 4",
    script: "Great Vibes",
  },
  invitation: {
    envelopeStyle: "kraft",
    cardStyle: "cream-paper",
    sealStyle: "wax",
    animation: "envelope",
  },
  sectionStyle: {
    spacing: "4.5rem",
    borderRadius: "1.25rem",
  },
};
