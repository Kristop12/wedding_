"use client";

import { useEffect, useState } from "react";

function partsBetween(now: number, target: number) {
  const remaining = Math.max(0, target - now);
  const totalSeconds = Math.floor(remaining / 1000);
  return [
    { label: "Days", value: Math.floor(totalSeconds / 86_400) },
    { label: "Hours", value: Math.floor(totalSeconds / 3_600) % 24 },
    { label: "Minutes", value: Math.floor(totalSeconds / 60) % 60 },
    { label: "Seconds", value: totalSeconds % 60 },
  ];
}

export function Countdown({ targetIso }: { targetIso: string | null }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!targetIso) {
    return <p className="text-center text-sm">The wedding date is not set yet.</p>;
  }

  const target = Date.parse(targetIso);
  if (Number.isNaN(target)) {
    return <p className="text-center text-sm">The wedding date is not set yet.</p>;
  }

  if (now === null) {
    return (
      <div className="grid grid-cols-4 gap-3" role="timer" aria-busy="true" aria-label="Countdown">
        {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
          <div key={label} className="text-center">
            <div className="font-[family-name:var(--theme-heading)] text-3xl">–</div>
            <div className="mt-1 text-[11px] tracking-[0.16em] uppercase opacity-70">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (now >= target) {
    return <p className="text-center font-[family-name:var(--theme-script)] text-3xl">The day has arrived</p>;
  }

  return (
    <div
      className="grid grid-cols-4 gap-3"
      role="timer"
      aria-label={partsBetween(now, target).map((part) => `${part.value} ${part.label}`).join(", ")}
    >
      {partsBetween(now, target).map((part) => (
        <div key={part.label} className="text-center">
          <div className="font-[family-name:var(--theme-heading)] text-3xl tabular-nums">
            {String(part.value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[11px] tracking-[0.16em] uppercase opacity-70">{part.label}</div>
        </div>
      ))}
    </div>
  );
}
