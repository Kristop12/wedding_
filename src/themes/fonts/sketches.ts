import { Allura, Cormorant_Garamond, Italianno, Lora, Nunito_Sans, Playfair_Display } from "next/font/google";
import { rusticFontClassName } from "./rustic";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-playfair",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-lora",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-nunito",
});

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-allura",
});

const italianno = Italianno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italianno",
});

export const sketchFontClassName = [
  rusticFontClassName,
  cormorant.variable,
  playfair.variable,
  lora.variable,
  nunito.variable,
  allura.variable,
  italianno.variable,
].join(" ");
