"use client";

export default function InvitationError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Invitation unavailable</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">This invitation could not be opened. Try again.</p>
      <button type="button" className="mt-6 text-sm underline" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
