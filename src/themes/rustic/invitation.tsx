"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bloom, Sprig } from "./ornaments";
import type { ThemeViewModel } from "../types";

const ENVELOPE_PAPER = {
  kraft: { paper: "#C4A484", flap: "#B8956C", ink: "#3B2A22" },
  cream: { paper: "#F3E6D4", flap: "#E6D2B6", ink: "#332D29" },
  sage: { paper: "#C9D3C4", flap: "#B7C4B0", ink: "#2C332C" },
} as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function RusticInvitation({
  model,
  opened,
  onOpen,
  onEnter,
}: {
  model: ThemeViewModel;
  opened: boolean;
  onOpen: () => void;
  onEnter: () => void;
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"sealed" | "opening" | "card">(opened ? "card" : "sealed");

  function openEnvelope() {
    if (phase !== "sealed") {
      return;
    }
    onOpen();
    setPhase(reduce ? "card" : "opening");
  }

  return (
    <motion.div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-16"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.7, ease }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 12%, color-mix(in srgb, var(--theme-secondary) 30%, transparent), transparent 34%), radial-gradient(circle at 88% 86%, color-mix(in srgb, var(--theme-primary) 16%, transparent), transparent 30%)",
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-6 left-2 text-[var(--theme-secondary)]"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sprig className="h-32 w-16" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="absolute right-2 bottom-8 text-[var(--theme-primary)]"
        animate={reduce ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Bloom className="h-16 w-16" />
      </motion.div>

      {phase === "card" ? (
        <InvitationCard model={model} onEnter={onEnter} reduce={Boolean(reduce)} />
      ) : (
        <Envelope
          model={model}
          opening={phase === "opening"}
          reduce={Boolean(reduce)}
          onOpen={openEnvelope}
          onOpened={() => setPhase("card")}
        />
      )}
    </motion.div>
  );
}

function Envelope({
  model,
  opening,
  reduce,
  onOpen,
  onOpened,
}: {
  model: ThemeViewModel;
  opening: boolean;
  reduce: boolean;
  onOpen: () => void;
  onOpened: () => void;
}) {
  const paper = ENVELOPE_PAPER[model.config.invitation.envelopeStyle];
  const initials = model.sealInitials.replace("&", " & ");

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative w-full max-w-sm cursor-pointer text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--theme-accent)]"
      aria-label="Open invitation"
    >
      <motion.p
        className="font-[family-name:var(--theme-script)] text-4xl text-[var(--theme-accent)]"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0 : 0.45, duration: 0.5 }}
      >
        {model.greeting}
      </motion.p>
      <motion.p
        className="mt-3 text-xs tracking-[0.28em] uppercase"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.7, duration: 0.4 }}
      >
        You&apos;re invited
      </motion.p>
      <motion.p
        className="mt-2 text-sm tracking-[0.42em] uppercase text-[var(--theme-accent)]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.85, duration: 0.4 }}
      >
        {initials}
      </motion.p>
      <motion.div
        className="relative mx-auto mt-6 aspect-[5/3.4] w-full max-w-sm shadow-[0_22px_40px_rgba(51,45,41,0.16)]"
        style={{ perspective: 1000, backgroundColor: paper.paper, color: paper.ink }}
        initial={reduce ? false : { opacity: 0, y: 36 }}
        animate={opening ? { y: 28, opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: opening || reduce ? 0 : 0.25, duration: reduce ? 0 : 0.75, ease }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[48%]"
          style={{
            background: "linear-gradient(180deg, transparent, color-mix(in srgb, black 8%, transparent))",
            clipPath: "polygon(0 100%, 50% 16%, 100% 100%)",
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 h-[58%] origin-top"
          animate={opening ? { rotateX: 180 } : { rotateX: 0 }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.28, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (opening) {
              onOpened();
            }
          }}
          style={{
            backgroundColor: paper.flap,
            clipPath: "polygon(0 0, 100% 0, 50% 78%)",
            backfaceVisibility: "hidden",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 z-20 flex size-[4.75rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--theme-primary)] text-[var(--theme-surface)] shadow-[0_10px_18px_rgba(51,45,41,0.28)]"
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={opening ? { scale: 1.35, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ delay: opening || reduce ? 0 : 1, duration: reduce ? 0 : 0.45 }}
        >
          <span className="font-[family-name:var(--theme-script)] text-2xl">{model.sealInitials}</span>
        </motion.div>
      </motion.div>
      <motion.p
        className="mt-5 text-sm tracking-[0.22em] uppercase"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ delay: reduce ? 0 : 1.15, duration: 0.35 }}
      >
        Tap to open
      </motion.p>
    </button>
  );
}

function InvitationCard({
  model,
  onEnter,
  reduce,
}: {
  model: ThemeViewModel;
  onEnter: () => void;
  reduce: boolean;
}) {
  return (
    <motion.article
      className="relative w-full max-w-md px-8 py-12 text-center shadow-[0_22px_44px_rgba(51,45,41,0.14)]"
      style={{ backgroundColor: "var(--theme-surface)", borderRadius: "var(--theme-radius)" }}
      initial={reduce ? false : { y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.75, ease }}
    >
      <Bloom className="mx-auto mb-2 h-12 w-12 text-[var(--theme-secondary)]" />
      <p className="text-xs tracking-[0.32em] uppercase text-[var(--theme-accent)]">{model.monogram}</p>
      <p className="mt-6 text-sm">Together with their families</p>
      <h1 className="mt-4 font-[family-name:var(--theme-heading)] text-3xl tracking-[0.14em] uppercase">
        {model.partnerOneName}
      </h1>
      <p className="font-[family-name:var(--theme-script)] text-5xl leading-none text-[var(--theme-primary)]">&</p>
      <p className="font-[family-name:var(--theme-heading)] text-3xl tracking-[0.14em] uppercase">
        {model.partnerTwoName}
      </p>
      <p className="mx-auto mt-6 max-w-xs text-sm leading-6">invite you to celebrate their wedding</p>
      {model.weekdayLine ? (
        <div className="mt-8 space-y-1">
          <p className="text-sm tracking-[0.18em] uppercase">{model.weekdayLine}</p>
          <p className="font-[family-name:var(--theme-heading)] text-lg">{model.dateLine}</p>
          {model.timeLine ? <p className="text-sm">{model.timeLine}</p> : null}
        </div>
      ) : (
        <p className="mt-8 text-sm">Date to be announced</p>
      )}
      {model.location ? <p className="mt-6 text-sm leading-6">{model.location}</p> : null}
      <motion.button
        type="button"
        onClick={onEnter}
        className="mt-8 inline-flex h-11 items-center rounded-full bg-[var(--theme-primary)] px-6 text-sm text-[var(--theme-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)]"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0 : 0.45, duration: 0.4 }}
      >
        Enter Our Wedding
      </motion.button>
    </motion.article>
  );
}
