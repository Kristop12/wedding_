"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true);
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="bg-muted max-w-full truncate rounded-md px-2 py-1 text-xs">{value}</code>
      <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
        {copied ? "Copied" : label}
      </Button>
      {failed ? <span className="text-destructive text-xs">Copy this link manually.</span> : null}
    </div>
  );
}
