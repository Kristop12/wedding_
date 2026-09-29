import type { EnvelopeStyle } from "./options";

export interface WeddingThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  typography: {
    heading: string;
    body: string;
    script: string;
  };
  invitation: {
    envelopeStyle: EnvelopeStyle;
    cardStyle: string;
    sealStyle: string;
    animation: string;
  };
  sectionStyle: {
    spacing: string;
    borderRadius: string;
  };
}

export type ThemeSectionType =
  | "HERO"
  | "COUNTDOWN"
  | "STORY"
  | "EVENTS"
  | "ENTOURAGE"
  | "DRESS_CODE"
  | "GALLERY"
  | "RSVP"
  | "GIFTS"
  | "FAQ";

export type ThemeViewModel = {
  config: WeddingThemeConfig;
  partnerOneName: string;
  partnerTwoName: string;
  monogram: string;
  sealInitials: string;
  greeting: string;
  weekdayLine: string | null;
  dateLine: string | null;
  timeLine: string | null;
  location: string | null;
  description: string | null;
  countdownTarget: string | null;
  musicEnabled: boolean;
  musicUrl: string | null;
  audience: "public" | "invitation" | "preview";
  sections: ThemeSectionType[];
  events: {
    id: string;
    name: string;
    description: string | null;
    when: string;
    dateLabel: string;
    timeLabel: string;
    venue: string | null;
    address: string | null;
    mapUrl: string | null;
    dressCode: string | null;
  }[];
  story: {
    id: string;
    title: string;
    date: string | null;
    description: string | null;
    imageUrl: string | null;
  }[];
  gallery: {
    id: string;
    imageUrl: string;
    caption: string | null;
  }[];
  dressCodes: string[];
  entourage: string[];
  faqs: { id: string; question: string; answer: string }[];
  gifts: {
    id: string;
    type: "QRPH" | "BANK" | "GCASH" | "MAYA" | "REGISTRY" | "CUSTOM";
    name: string;
    accountName: string | null;
    institutionName: string | null;
    maskedAccountNumber: string | null;
    description: string | null;
    imageUrl: string | null;
    externalUrl: string | null;
  }[];
};

export type ThemeSettingsRecord = {
  primaryColor: string | null;
  accentColor: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  scriptFont: string | null;
  customConfigJson: unknown;
};
