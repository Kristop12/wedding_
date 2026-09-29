"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bloom } from "../rustic/ornaments";
import type { ThemeViewModel } from "../types";

const ease = [0.22, 1, 0.36, 1] as const;

export function TropicalInvitation({
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

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--theme-secondary) 55%, transparent), transparent 28%), radial-gradient(circle at 88% 80%, color-mix(in srgb, var(--theme-accent) 28%, transparent), transparent 32%)",
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-8 left-4 text-[var(--theme-primary)]"
        animate={reduce || phase !== "sealed" ? undefined : { rotate: [-8, 6, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Bloom className="h-16 w-16" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="absolute right-6 bottom-10 text-[var(--theme-accent)]"
        animate={reduce || phase !== "sealed" ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Bloom className="h-12 w-12" />
      </motion.div>

      {phase === "card" ? (
        <motion.article
          className="relative w-full max-w-md bg-[var(--theme-surface)] px-8 py-12 text-center shadow-[0_22px_40px_rgba(36,48,40,0.12)]"
          style={{ borderRadius: "1.75rem" }}
          initial={reduce ? false : { scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.55, ease }}
        >
          <Bloom className="mx-auto h-12 w-12 text-[var(--theme-primary)]" />
          <p className="mt-2 text-xs tracking-[0.28em] uppercase text-[var(--theme-accent)]">{model.monogram}</p>
          <h1 className="mt-4 font-[family-name:var(--theme-script)] text-5xl text-[var(--theme-primary)]">
            {model.partnerOneName} & {model.partnerTwoName}
          </h1>
          {model.dateLine ? <p className="mt-4 text-sm">{model.dateLine}</p> : <p className="mt-4 text-sm">Date to be announced</p>}
          {model.location ? <p className="mt-2 text-sm">{model.location}</p> : null}
          <button
            type="button"
            onClick={onEnter}
            className="mt-8 inline-flex h-11 items-center rounded-full bg-[var(--theme-primary)] px-6 text-sm text-[var(--theme-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)]"
          >
            Enter Our Wedding
          </button>
        </motion.article>
      ) : (
        <button
          type="button"
          onClick={open}
          className="relative w-full max-w-sm text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--theme-accent)]"
          aria-label="Open invitation"
        >
          <p className="font-[family-name:var(--theme-script)] text-4xl text-[var(--theme-primary)]">{model.greeting}</p>
          <p className="mt-2 text-xs tracking-[0.28em] uppercase text-[var(--theme-accent)]">You&apos;re invited</p>
          <div className="relative mx-auto mt-6 aspect-square w-56">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 text-[var(--theme-primary)]"
              animate={phase === "opening" ? { x: -90, rotate: -30, opacity: 0 } : { x: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.7, ease }}
            >
              <Bloom className="h-full w-full" />
            </motion.div>
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 text-[var(--theme-accent)]"
              animate={phase === "opening" ? { x: 90, rotate: 30, opacity: 0 } : { x: 8, rotate: 12, opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.7, ease }}
              onAnimationComplete={() => {
                if (phase === "opening") {
                  setPhase("card");
                }
              }}
            >
              <Bloom className="h-full w-full" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-[family-name:var(--theme-script)] text-3xl text-[var(--theme-text)]">{model.sealInitials}</span>
            </div>
          </div>
          <p className="mt-4 text-sm tracking-[0.22em] uppercase">Tap to open</p>
        </button>
      )}
    </div>
  );
}
