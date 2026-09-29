import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicWeddingView } from "@/components/wedding/public-wedding-view";
import { themeFontsFor } from "@/themes/font-scope";
import { env } from "@/lib/env";
import { loadPublicWedding } from "@/lib/weddings/public-site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadPublicWedding(slug);
  if (site.status !== "ready") {
    return { title: "Wedding", robots: { index: false, follow: false } };
  }

  const title = `${site.model.partnerOneName} & ${site.model.partnerTwoName}`;
  const description = site.model.description ?? `The wedding of ${site.model.partnerOneName} and ${site.model.partnerTwoName}.`;
  const image = site.model.gallery[0]?.imageUrl;
  const imageUrl = image
    ? image.startsWith("/")
      ? `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}${image}`
      : image
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await loadPublicWedding(slug);

  if (site.status === "missing") {
    notFound();
  }

  if (site.status === "disabled") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">This wedding page is not available.</h1>
      </main>
    );
  }

  if (site.status === "unpublished") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Wedding Not Published</h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">This wedding page is not available yet.</p>
      </main>
    );
  }

  const fonts = await themeFontsFor(site.model.config.id);
  return (
    <div className={`${fonts} min-h-dvh`}>
      <PublicWeddingView model={site.model} />
    </div>
  );
}
