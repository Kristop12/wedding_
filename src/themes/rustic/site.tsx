import Image from "next/image";
import { Countdown } from "../countdown";
import { GalleryGrid } from "../gallery-grid";
import { GiftCards } from "../gift-cards";
import { GuestNav } from "../guest-nav";
import type { ThemeSectionType, ThemeViewModel } from "../types";

const ANCHORS: Record<ThemeSectionType, string> = {
  HERO: "hero",
  COUNTDOWN: "countdown",
  STORY: "story",
  EVENTS: "events",
  ENTOURAGE: "entourage",
  DRESS_CODE: "dress-code",
  GALLERY: "gallery",
  RSVP: "rsvp",
  GIFTS: "gifts",
  FAQ: "faq",
};

export type SiteTone = "rustic" | "elegant" | "modern" | "tropical";

const TONE = {
  rustic: {
    title: "text-center font-[family-name:var(--theme-script)] text-4xl text-[var(--theme-primary)]",
    hero: "mt-4 font-[family-name:var(--theme-script)] text-5xl text-[var(--theme-primary)]",
    footer: "font-[family-name:var(--theme-script)] text-3xl text-[var(--theme-primary)]",
    story: "border-l border-[var(--theme-secondary)] pl-4",
  },
  elegant: {
    title: "text-center font-[family-name:var(--theme-heading)] text-2xl tracking-[0.22em] uppercase",
    hero: "mt-4 font-[family-name:var(--theme-heading)] text-4xl tracking-[0.08em] uppercase",
    footer: "font-[family-name:var(--theme-heading)] text-2xl tracking-[0.18em] uppercase",
    story: "border-t border-[var(--theme-accent)] pt-4",
  },
  modern: {
    title: "text-center text-xs font-semibold tracking-[0.42em] uppercase text-[var(--theme-accent)]",
    hero: "mt-4 font-[family-name:var(--theme-heading)] text-5xl tracking-tight",
    footer: "font-[family-name:var(--theme-heading)] text-3xl tracking-tight",
    story: "border-l-2 border-[var(--theme-primary)] pl-4",
  },
  tropical: {
    title: "text-center font-[family-name:var(--theme-script)] text-4xl text-[var(--theme-primary)]",
    hero: "mt-4 font-[family-name:var(--theme-script)] text-5xl text-[var(--theme-accent)]",
    footer: "font-[family-name:var(--theme-script)] text-3xl text-[var(--theme-accent)]",
    story: "border-l-2 border-[var(--theme-accent)] pl-4",
  },
} as const;

const NAV_LABELS: Partial<Record<ThemeSectionType, string>> = {
  HERO: "Home",
  EVENTS: "Events",
  RSVP: "RSVP",
  STORY: "Our Story",
  GALLERY: "Gallery",
  ENTOURAGE: "Entourage",
  DRESS_CODE: "Dress Code",
  GIFTS: "Gifts",
  FAQ: "FAQ",
};

export function WeddingSite({
  model,
  rsvpForm = null,
  tone = "rustic",
}: {
  model: ThemeViewModel;
  rsvpForm?: React.ReactNode;
  tone?: SiteTone;
}) {
  const sections = model.sections.filter((section) => model.audience === "public" ? section !== "GIFTS" : true);
  const primary = (["HERO", "EVENTS", "RSVP"] as const)
    .filter((section) => sections.includes(section))
    .map((section) => ({ href: `#${ANCHORS[section]}`, label: NAV_LABELS[section] ?? section }));
  const more = (["STORY", "GALLERY", "ENTOURAGE", "DRESS_CODE", "GIFTS", "FAQ"] as const)
    .filter((section) => sections.includes(section))
    .map((section) => ({ href: `#${ANCHORS[section]}`, label: NAV_LABELS[section] ?? section }));
  more.push({ href: "#footer", label: "Contact" });

  return (
    <div className="pb-24 md:pb-0">
      {sections.map((section) => (
        <RusticSection key={section} section={section} model={model} rsvpForm={rsvpForm} tone={tone} />
      ))}
      <footer id="footer" className="px-6 py-12 text-center text-sm">
        <p className={TONE[tone].footer}>
          {model.partnerOneName} & {model.partnerTwoName}
        </p>
        {model.location ? <p className="mt-3">{model.location}</p> : null}
      </footer>
      <GuestNav primary={primary} more={more} />
    </div>
  );
}

export function RusticSite({
  model,
  rsvpForm = null,
}: {
  model: ThemeViewModel;
  rsvpForm?: React.ReactNode;
}) {
  return <WeddingSite model={model} rsvpForm={rsvpForm} tone="rustic" />;
}

function RusticSection({
  section,
  model,
  rsvpForm,
  tone,
}: {
  section: ThemeSectionType;
  model: ThemeViewModel;
  rsvpForm?: React.ReactNode;
  tone: SiteTone;
}) {
  switch (section) {
    case "HERO":
      return <Hero model={model} tone={tone} />;
    case "COUNTDOWN":
      return (
        <Section id={ANCHORS.COUNTDOWN} title="Counting down" tone={tone}>
          <Countdown targetIso={model.countdownTarget} />
        </Section>
      );
    case "STORY":
      return <Story model={model} tone={tone} />;
    case "EVENTS":
      return <Events model={model} tone={tone} />;
    case "ENTOURAGE":
      return <Entourage model={model} tone={tone} />;
    case "DRESS_CODE":
      return <DressCode model={model} tone={tone} />;
    case "GALLERY":
      return <Gallery model={model} tone={tone} />;
    case "RSVP":
      return (
        <Section id={ANCHORS.RSVP} title="Kindly reply" tone={tone}>
          {rsvpForm ?? (
            <p className="text-center text-sm leading-6">
              {model.audience === "public"
                ? "Please reply from the personal invitation link you received."
                : "Guests reply from their own invitation link. This preview does not collect a response."}
            </p>
          )}
        </Section>
      );
    case "GIFTS":
      return <Gifts model={model} tone={tone} />;
    case "FAQ":
      return <Faq model={model} tone={tone} />;
    default:
      return null;
  }
}

function Section({
  id,
  title,
  tone,
  children,
}: {
  id: string;
  title: string;
  tone: SiteTone;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 px-6 py-14">
      <h2 className={TONE[tone].title}>{title}</h2>
      <div className="mx-auto mt-8 max-w-xl">{children}</div>
    </section>
  );
}

function Hero({ model, tone }: { model: ThemeViewModel; tone: SiteTone }) {
  return (
    <section id="hero" className="scroll-mt-6 px-6 py-16 text-center">
      <p className="text-xs tracking-[0.32em] uppercase text-[var(--theme-accent)]">{model.monogram}</p>
      <h1 className={TONE[tone].hero}>
        {model.partnerOneName} <span className="text-[var(--theme-accent)]">&</span> {model.partnerTwoName}
      </h1>
      {model.dateLine ? <p className="mt-4 font-[family-name:var(--theme-heading)]">{model.dateLine}</p> : null}
      {model.location ? <p className="mt-2 text-sm">{model.location}</p> : null}
      {model.description ? <p className="mx-auto mt-6 max-w-md text-sm leading-6">{model.description}</p> : null}
    </section>
  );
}

function Story({ model, tone }: { model: ThemeViewModel; tone: SiteTone }) {
  return (
    <Section id={ANCHORS.STORY} title="Our story" tone={tone}>
      {model.story.length === 0 ? (
        <p className="text-center text-sm">Story entries will appear here.</p>
      ) : (
        <ol className="space-y-8">
          {model.story.map((item) => (
            <li key={item.id} className={TONE[tone].story}>
              {item.date ? (
                <p className="text-xs tracking-[0.16em] uppercase text-[var(--theme-accent)]">{item.date}</p>
              ) : null}
              <h3 className="font-[family-name:var(--theme-heading)] text-lg">{item.title}</h3>
              {item.description ? <p className="mt-1 text-sm leading-6">{item.description}</p> : null}
              {item.imageUrl ? <StoryImage src={item.imageUrl} /> : null}
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

function StoryImage({ src }: { src: string }) {
  const className = "mt-3 aspect-[4/3] w-full object-cover";
  const style = { borderRadius: "var(--theme-radius)" };
  if (src.startsWith("/") && !src.startsWith("//")) {
    return (
      <Image
        src={src}
        alt=""
        width={800}
        height={600}
        unoptimized={src.endsWith(".svg")}
        className={className}
        style={style}
      />
    );
  }

  return (
    // Couple-provided photos can live on any https host.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" className={className} style={style} />
  );
}

function Events({ model, tone }: { model: ThemeViewModel; tone: SiteTone }) {
  return (
    <Section id={ANCHORS.EVENTS} title="Events" tone={tone}>
      {model.events.length === 0 ? (
        <p className="text-center text-sm">Events will appear here.</p>
      ) : (
        <ul className="space-y-6">
          {model.events.map((event) => (
            <li
              key={event.id}
              className="px-5 py-5"
              style={{ backgroundColor: "var(--theme-surface)", borderRadius: "var(--theme-radius)" }}
            >
              <h3 className="font-[family-name:var(--theme-heading)] text-lg">{event.name}</h3>
              <p className="mt-2 text-sm">{event.dateLabel}</p>
              <p className="text-sm">{event.timeLabel}</p>
              {event.venue ? <p className="mt-3 text-sm">{event.venue}</p> : null}
              {event.address ? <p className="text-sm opacity-80">{event.address}</p> : null}
              {event.dressCode ? <p className="mt-2 text-sm">Dress code: {event.dressCode}</p> : null}
              {event.description ? <p className="mt-2 text-sm leading-6">{event.description}</p> : null}
              {event.mapUrl ? (
                <a
                  href={event.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-[var(--theme-primary)] underline"
                >
                  View Map
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Entourage({ model, tone }: { model: ThemeViewModel; tone: SiteTone }) {
  return (
    <Section id={ANCHORS.ENTOURAGE} title="Entourage" tone={tone}>
      {model.entourage.length === 0 ? (
        <p className="text-center text-sm">Guests in the Entourage group will be listed here.</p>
      ) : (
        <ul className="space-y-2 text-center text-sm">
          {model.entourage.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function DressCode({ model, tone }: { model: ThemeViewModel; tone: SiteTone }) {
  return (
    <Section id={ANCHORS.DRESS_CODE} title="Dress code" tone={tone}>
      {model.dressCodes.length === 0 ? (
        <p className="text-center text-sm">Dress code will appear with the events.</p>
      ) : (
        <ul className="space-y-2 text-center">
          {model.dressCodes.map((code) => (
            <li key={code} className="font-[family-name:var(--theme-heading)] text-lg">
              {code}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Gallery({ model, tone }: { model: ThemeViewModel; tone: SiteTone }) {
  return (
    <Section id={ANCHORS.GALLERY} title="Gallery" tone={tone}>
      {model.gallery.length === 0 ? (
        <p className="text-center text-sm">Photos will appear here.</p>
      ) : (
        <GalleryGrid items={model.gallery} />
      )}
    </Section>
  );
}

function Gifts({ model, tone }: { model: ThemeViewModel; tone: SiteTone }) {
  return (
    <Section id={ANCHORS.GIFTS} title="Wedding gifts" tone={tone}>
      {model.gifts.length === 0 ? (
        <p className="text-center text-sm leading-6">
          {model.audience === "invitation"
            ? "Gift details will appear here."
            : "Enabled gift options appear on each guest's invitation."}
        </p>
      ) : (
        <GiftCards gifts={model.gifts} />
      )}
    </Section>
  );
}

function Faq({ model, tone }: { model: ThemeViewModel; tone: SiteTone }) {
  return (
    <Section id={ANCHORS.FAQ} title="Questions" tone={tone}>
      {model.faqs.length === 0 ? (
        <p className="text-center text-sm leading-6">No questions yet.</p>
      ) : (
        <div className="space-y-6">
          {model.faqs.map((item) => (
            <article key={item.id}>
              <h3 className="font-[family-name:var(--theme-heading)] text-lg">{item.question}</h3>
              <p className="mt-1 text-sm leading-6">{item.answer}</p>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
