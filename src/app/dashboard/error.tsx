"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground text-sm">This page could not be loaded. Try again.</p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </section>
  );
}
