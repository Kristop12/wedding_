"use client";

import { useState } from "react";
import type { ThemeViewModel } from "./types";

type Gift = ThemeViewModel["gifts"][number];

export function GiftCards({ gifts }: { gifts: Gift[] }) {
  return (
    <ul className="space-y-8">
      {gifts.map((gift) => (
        <li key={gift.id} className="text-center">
          <GiftCard gift={gift} />
        </li>
      ))}
    </ul>
  );
}

function GiftCard({ gift }: { gift: Gift }) {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    if (!gift.maskedAccountNumber) {
      return;
    }
    try {
      await navigator.clipboard.writeText(gift.maskedAccountNumber);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article>
      <h3 className="font-[family-name:var(--theme-heading)] text-xl">{gift.name}</h3>
      {gift.accountName ? <p className="mt-2 text-sm">{gift.accountName}</p> : null}
      {gift.institutionName ? <p className="text-sm">{gift.institutionName}</p> : null}
      {gift.imageUrl ? (
        <>
          {/* The QR is served only after the invitation token is checked. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gift.imageUrl}
            alt={`${gift.name} QR code`}
            className="mx-auto mt-4 w-full max-w-56"
          />
          <p className="mt-3 text-sm leading-6">Scan using your preferred bank or e-wallet application.</p>
          <a
            href={`${gift.imageUrl}?download=1`}
            download
            className="mt-3 inline-block text-sm underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Save QR Code
          </a>
        </>
      ) : null}
      {gift.maskedAccountNumber ? (
        <div className="mt-3">
          <p className="text-sm tracking-wide">{gift.maskedAccountNumber}</p>
          <button
            type="button"
            className="mt-2 text-sm underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => void copyNumber()}
          >
            {copied ? "Copied" : "Copy Account Number"}
          </button>
        </div>
      ) : null}
      {gift.description ? <p className="mt-3 text-sm leading-6">{gift.description}</p> : null}
      {gift.externalUrl ? (
        <a
          href={gift.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Open registry
        </a>
      ) : null}
    </article>
  );
}
