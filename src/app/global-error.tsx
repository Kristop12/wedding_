"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 max-w-sm text-sm">This page could not be loaded. Try again.</p>
        <button type="button" className="mt-6 text-sm underline" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
