"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ThemeViewModel } from "../types";

const ease = [0.22, 1, 0.36, 1] as const;

export function ElegantInvitation({
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
  const [phase, setPhase] = useState<"sealed" | "card">(opened ? "card" : "sealed");

  function open() {
    if (phase !== "sealed") {
      return;
    }
    onOpen();
    setPhase("card");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent, color-mix(in srgb, var(--theme-accent) 12%, transparent) 50%, transparent)",
        }}
      />
      <motion.article
        className="relative w-full max-w-md bg-[var(--theme-surface)] px-8 py-14 text-center shadow-[0_24px_50px_rgba(31,26,23,0.08)]"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.7, ease }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-[var(--theme-accent)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-5 border border-[var(--theme-accent)]/35" />
        {phase === "sealed" ? (
          <button
            type="button"
            onClick={open}
            className="relative w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--theme-accent)]"
            aria-label="Open invitation"
          >
            <p className="font-[family-name:var(--theme-script)] text-5xl text-[var(--theme-accent)]">{model.greeting}</p>
            <motion.div
              className="mx-auto mt-8 flex size-28 items-center justify-center rounded-full border border-[var(--theme-accent)]"
              animate={reduce ? undefined : { rotate: [0, 6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="font-[family-name:var(--theme-heading)] text-xl tracking-[0.22em] uppercase">
                {model.sealInitials}
              </span>
            </motion.div>
            <p className="mt-8 text-xs tracking-[0.32em] uppercase">Tap to open</p>
          </button>
        ) : (
          <CardBody model={model} onEnter={onEnter} reduce={reduce} />
        )}
      </motion.article>
    </div>
  );
}

function CardBody({
  model,
  onEnter,
  reduce,
}: {
  model: ThemeViewModel;
  onEnter: () => void;
  reduce: boolean;
}) {
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.6, ease }}>
      <p className="text-xs tracking-[0.32em] uppercase text-[var(--theme-accent)]">{model.monogram}</p>
      <p className="mt-6 text-sm">Together with their families</p>
      <h1 className="mt-4 font-[family-name:var(--theme-heading)] text-3xl tracking-[0.12em] uppercase">{model.partnerOneName}</h1>
      <p className="font-[family-name:var(--theme-script)] text-5xl leading-none text-[var(--theme-accent)]">&</p>
      <p className="font-[family-name:var(--theme-heading)] text-3xl tracking-[0.12em] uppercase">{model.partnerTwoName}</p>
      <p className="mx-auto mt-6 max-w-xs text-sm leading-6">request the pleasure of your company</p>
      {model.dateLine ? <p className="mt-8 font-[family-name:var(--theme-heading)]">{model.dateLine}</p> : <p className="mt-8 text-sm">Date to be announced</p>}
      {model.timeLine ? <p className="mt-1 text-sm">{model.timeLine}</p> : null}
      {model.location ? <p className="mt-4 text-sm leading-6">{model.location}</p> : null}
      <button
        type="button"
        onClick={onEnter}
        className="mt-8 inline-flex h-11 items-center border border-[var(--theme-primary)] px-6 text-xs tracking-[0.22em] uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)]"
      >
        Enter Our Wedding
      </button>
    </motion.div>
  );
}
