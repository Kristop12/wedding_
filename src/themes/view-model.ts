import { formatEventWhen } from "@/lib/weddings/datetime";
import { defaultSealInitials } from "./options";
import { readCustomConfig, resolveTheme } from "./resolve";
import type { ThemeSectionType, ThemeSettingsRecord, ThemeViewModel } from "./types";

const SECTION_TYPES = new Set<ThemeSectionType>([
  "HERO",
  "COUNTDOWN",
  "STORY",
  "EVENTS",
  "ENTOURAGE",
  "DRESS_CODE",
  "GALLERY",
  "RSVP",
  "GIFTS",
  "FAQ",
]);

export type ThemeWeddingSource = {
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate: Date | null;
  timezone: string;
  location: string | null;
  description: string | null;
  themeId: string;
  themeSettings: ThemeSettingsRecord | null;
  sections: { type: string; enabled: boolean; sortOrder: number }[];
  events: {
    id: string;
    name: string;
    description: string | null;
    startAt: Date;
    venueName: string | null;
    address: string | null;
    mapUrl: string | null;
    dressCode: string | null;
  }[];
  storyItems: {
    id: string;
    title: string;
    description: string | null;
    date: string | null;
    imageUrl: string | null;
  }[];
  galleryItems: {
    id: string;
    imageUrl: string;
    caption: string | null;
  }[];
  faqItems: {
    id: string;
    question: string;
    answer: string;
  }[];
  giftAccounts: {
    id: string;
    type: "QRPH" | "BANK" | "GCASH" | "MAYA" | "REGISTRY" | "CUSTOM";
    displayName: string;
    accountName: string | null;
    institutionName: string | null;
    maskedAccountNumber: string | null;
    description: string | null;
    imageUrl: string | null;
    externalUrl: string | null;
  }[];
  entourageGuests: { firstName: string; lastName: string }[];
  greetingNames: string[];
};

function isSectionType(value: string): value is ThemeSectionType {
  return SECTION_TYPES.has(value as ThemeSectionType);
}

function formatWeekday(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(date);
}

function formatMonthDay(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatClock(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function greetingFrom(names: string[]) {
  if (names.length === 0) {
    return "For your guests";
  }
  if (names.length === 1) {
    return `For ${names[0]}`;
  }
  if (names.length === 2) {
    return `For ${names[0]} & ${names[1]}`;
  }
  return `For ${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function buildThemeViewModel(
  wedding: ThemeWeddingSource,
  themeId = wedding.themeId,
): ThemeViewModel {
  const saved = wedding.themeSettings;
  const settings: ThemeSettingsRecord | null =
    themeId === wedding.themeId
      ? saved
      : saved
        ? {
            primaryColor: null,
            accentColor: null,
            headingFont: null,
            bodyFont: null,
            scriptFont: null,
            customConfigJson: saved.customConfigJson,
          }
        : null;
  const config = resolveTheme(themeId, settings);
  const custom = readCustomConfig(wedding.themeSettings?.customConfigJson);
  const timeZone = wedding.timezone;
  const firstEvent = wedding.events[0];
  const dressCodes = [
    ...new Set(wedding.events.map((event) => event.dressCode).filter((code): code is string => Boolean(code))),
  ];

  return {
    config,
    partnerOneName: wedding.partnerOneName,
    partnerTwoName: wedding.partnerTwoName,
    monogram: defaultSealInitials(wedding.partnerOneName, wedding.partnerTwoName),
    sealInitials:
      custom.sealInitials || defaultSealInitials(wedding.partnerOneName, wedding.partnerTwoName),
    greeting: greetingFrom(wedding.greetingNames),
    weekdayLine: wedding.weddingDate ? formatWeekday(wedding.weddingDate, timeZone) : null,
    dateLine: wedding.weddingDate ? formatMonthDay(wedding.weddingDate, timeZone) : null,
    timeLine: firstEvent ? formatClock(firstEvent.startAt, timeZone) : null,
    location: wedding.location,
    description: wedding.description,
    countdownTarget: wedding.weddingDate ? wedding.weddingDate.toISOString() : null,
    musicEnabled: custom.musicEnabled,
    musicUrl: custom.musicEnabled ? custom.musicUrl : null,
    audience: "preview",
    sections: wedding.sections
      .filter((section) => section.enabled && isSectionType(section.type))
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((section) => section.type as ThemeSectionType),
    events: wedding.events.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      when: formatEventWhen(event.startAt, timeZone),
      dateLabel: formatMonthDay(event.startAt, timeZone),
      timeLabel: formatClock(event.startAt, timeZone),
      venue: event.venueName,
      address: event.address,
      mapUrl: event.mapUrl,
      dressCode: event.dressCode,
    })),
    story: wedding.storyItems.map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date,
      description: item.description,
      imageUrl: item.imageUrl,
    })),
    gallery: wedding.galleryItems.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
      caption: item.caption,
    })),
    dressCodes,
    entourage: wedding.entourageGuests.map((guest) => `${guest.firstName} ${guest.lastName}`),
    faqs: wedding.faqItems.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
    })),
    gifts: wedding.giftAccounts.map((gift) => ({
      id: gift.id,
      type: gift.type,
      name: gift.displayName,
      accountName: gift.accountName,
      institutionName: gift.institutionName,
      maskedAccountNumber: gift.maskedAccountNumber,
      description: gift.description,
      imageUrl: gift.imageUrl,
      externalUrl: gift.externalUrl,
    })),
  };
}
