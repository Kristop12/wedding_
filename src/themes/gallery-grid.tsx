"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function GalleryGrid({
  items,
}: {
  items: { id: string; imageUrl: string; caption: string | null }[];
}) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null ? items[index] : null;

  useEffect(() => {
    if (index !== null) {
      closeRef.current?.focus();
    }
  }, [index]);

  useEffect(() => {
    if (index === null) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIndex(null);
      }
      if (event.key === "ArrowRight") {
        setIndex((current) => (current === null ? current : (current + 1) % items.length));
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) =>
          current === null ? current : (current - 1 + items.length) % items.length,
        );
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, itemIndex) => (
          <li key={item.id} className="overflow-hidden" style={{ borderRadius: "var(--theme-radius)" }}>
            <button type="button" className="block w-full" onClick={() => setIndex(itemIndex)}>
              <WeddingImage src={item.imageUrl} alt={item.caption ?? ""} />
            </button>
          </li>
        ))}
      </ul>
      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={open.caption ?? "Photo"}
        >
          <button type="button" className="absolute inset-0" aria-label="Close photo" onClick={() => setIndex(null)} />
          <div className="relative z-10 w-full max-w-3xl">
            <WeddingImage src={open.imageUrl} alt={open.caption ?? ""} priority />
            {open.caption ? <p className="mt-3 text-center text-sm text-white">{open.caption}</p> : null}
            <div className="mt-3 flex justify-center gap-3 text-sm text-white">
              <button type="button" onClick={() => setIndex((current) => (current === null ? 0 : (current - 1 + items.length) % items.length))}>
                Previous
              </button>
              <button ref={closeRef} type="button" onClick={() => setIndex(null)}>
                Close
              </button>
              <button type="button" onClick={() => setIndex((current) => (current === null ? 0 : (current + 1) % items.length))}>
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function WeddingImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  if (src.startsWith("/") && !src.startsWith("//")) {
    return (
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={900}
        priority={priority}
        unoptimized={src.endsWith(".svg")}
        className="aspect-[4/3] w-full object-cover"
      />
    );
  }

  return (
    // Remote couple-provided photos are not limited to one host, so the optimizer cannot fetch them.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className="aspect-[4/3] w-full object-cover" />
  );
}
