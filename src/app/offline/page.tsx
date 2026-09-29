import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">You are offline</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
        Pages you already opened can still appear. Sending a reply needs an internet connection.
      </p>
    </main>
  );
}
