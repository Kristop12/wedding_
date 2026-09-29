import { CoupleForm } from "@/components/wedding/couple-form";
import { DetailsForm } from "@/components/wedding/details-form";
import { FaqManager } from "@/components/wedding/faq-manager";
import { NoWedding } from "@/components/wedding/no-wedding";
import { PublishPanel } from "@/components/wedding/publish-panel";
import { SectionEditor } from "@/components/wedding/section-editor";
import { StoryManager } from "@/components/wedding/story-manager";
import { env } from "@/lib/env";
import { formatDateInput } from "@/lib/weddings/datetime";
import { loadActiveWorkspace, loadWebsiteContent } from "@/lib/weddings/queries";

export default async function WeddingPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; unpublished?: string }>;
}) {
  const query = await searchParams;
  const workspace = await loadActiveWorkspace();
  if (!workspace) {
    return <NoWedding title="Wedding" />;
  }

  const { wedding } = workspace;
  const content = await loadWebsiteContent();
  const origin = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wedding</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Names, date, website sections, and publishing.
        </p>
      </div>
      {query.published ? (
        <p className="text-sm" role="status">
          Your wedding is published.
        </p>
      ) : null}
      {query.unpublished ? (
        <p className="text-sm" role="status">
          Your wedding is back in draft.
        </p>
      ) : null}
      <CoupleForm
        weddingId={wedding.id}
        defaults={{
          partnerOneName: wedding.partnerOneName,
          partnerTwoName: wedding.partnerTwoName,
          slug: wedding.slug,
        }}
        submitLabel="Save couple"
      />
      <DetailsForm
        weddingId={wedding.id}
        defaults={{
          weddingDate: wedding.weddingDate
            ? formatDateInput(wedding.weddingDate, wedding.timezone)
            : "",
          timezone: wedding.timezone,
          location: wedding.location ?? "",
          description: wedding.description ?? "",
        }}
        submitLabel="Save wedding details"
      />
      <div className="max-w-3xl space-y-3">
        <h2 className="text-lg font-medium">Website sections</h2>
        <p className="text-muted-foreground text-sm">
          Choose which sections guests will see, and the order they appear in.
        </p>
        <SectionEditor
          weddingId={wedding.id}
          sections={wedding.sections.map((section) => ({
            id: section.id,
            type: section.type,
            enabled: section.enabled,
          }))}
        />
      </div>
      <StoryManager weddingId={wedding.id} items={content?.wedding.storyItems ?? []} />
      <FaqManager weddingId={wedding.id} items={content?.wedding.faqItems ?? []} />
      <PublishPanel
        weddingId={wedding.id}
        status={wedding.status}
        publicUrl={`${origin}/w/${wedding.slug}`}
        hasDate={Boolean(wedding.weddingDate)}
        eventCount={wedding.events.length}
        partyCount={wedding.guestParties.length}
        parties={wedding.guestParties.map((party) => ({
          name: party.name,
          url: `${origin}/i/${party.token}`,
        }))}
      />
    </section>
  );
}
