"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ThemeViewModel } from "../types";

const ease = [0.22, 1, 0.36, 1] as const;

export function ModernInvitation({
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
  const reduce = useReducedMotion() === true;
  const [phase, setPhase] = useState<"sealed" | "opening" | "card">(opened ? "card" : "sealed");

  function open() {
    if (phase !== "sealed") {
      return;
    }
    onOpen();
    setPhase(reduce ? "card" : "opening");
  }

  if (phase === "card") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5 py-16">
        <motion.article
          className="w-full max-w-md bg-[var(--theme-surface)] px-8 py-12 text-center"
          initial={reduce ? false : { y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.55, ease }}
        >
          <p className="text-xs font-semibold tracking-[0.42em] uppercase text-[var(--theme-accent)]">{model.monogram}</p>
          <h1 className="mt-6 font-[family-name:var(--theme-heading)] text-5xl tracking-tight">{model.partnerOneName}</h1>
          <p className="font-[family-name:var(--theme-script)] text-4xl text-[var(--theme-accent)]">&</p>
          <p className="font-[family-name:var(--theme-heading)] text-5xl tracking-tight">{model.partnerTwoName}</p>
          {model.dateLine ? <p className="mt-8 text-sm">{model.dateLine}</p> : <p className="mt-8 text-sm">Date to be announced</p>}
          {model.location ? <p className="mt-2 text-sm">{model.location}</p> : null}
          <button
            type="button"
            onClick={onEnter}
            className="mt-8 inline-flex h-11 items-center bg-[var(--theme-primary)] px-6 text-xs font-semibold tracking-[0.22em] uppercase text-[var(--theme-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Enter Our Wedding
          </button>
        </motion.article>
      </div>
    );
  }

  const opening = phase === "opening";

  return (
    <button
      type="button"
      onClick={open}
      className="grid min-h-dvh w-full grid-rows-2 text-left md:grid-cols-2 md:grid-rows-1"
      aria-label="Open invitation"
    >
      <motion.div
        className="flex items-end bg-[var(--theme-primary)] p-8 text-[var(--theme-surface)] md:items-center"
        animate={opening ? { x: "-100%" } : { x: 0 }}
        transition={{ duration: reduce ? 0 : 0.7, ease }}
      >
        <p className="font-[family-name:var(--theme-heading)] text-6xl tracking-tight">{model.sealInitials}</p>
      </motion.div>
      <motion.div
        className="flex flex-col justify-end p-8 md:justify-center"
        animate={opening ? { x: "100%" } : { x: 0 }}
        transition={{ duration: reduce ? 0 : 0.7, ease }}
        onAnimationComplete={() => {
          if (opening) {
            setPhase("card");
          }
        }}
      >
        <p className="text-xs font-semibold tracking-[0.42em] uppercase text-[var(--theme-accent)]">You&apos;re invited</p>
        <p className="mt-4 font-[family-name:var(--theme-heading)] text-4xl tracking-tight">{model.partnerOneName}</p>
        <p className="font-[family-name:var(--theme-heading)] text-4xl tracking-tight">{model.partnerTwoName}</p>
        <p className="mt-8 text-xs font-semibold tracking-[0.28em] uppercase">Tap to open</p>
      </motion.div>
    </button>
  );
}
