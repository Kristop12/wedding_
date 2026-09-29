import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">That page is not available.</p>
      <Link href="/" className="mt-6 text-sm underline-offset-4 hover:underline">
        Go home
      </Link>
    </main>
  );
}
