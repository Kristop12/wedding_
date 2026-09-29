import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation/invitation-view";
import { loadInvitation, recordInvitationOpen } from "@/lib/invitations/load";
import { themeFontsFor } from "@/themes/font-scope";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const invitation = await loadInvitation(token);
  if (invitation.status !== "ready") {
    return { title: "Invitation" };
  }

  return {
    title: `${invitation.model.partnerOneName} & ${invitation.model.partnerTwoName}`,
    description: invitation.model.greeting,
  };
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = await loadInvitation(token);

  if (invitation.status === "missing") {
    notFound();
  }

  if (invitation.status === "disabled") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Invitation Disabled</h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">This invitation is no longer available.</p>
      </main>
    );
  }

  if (invitation.status === "unpublished") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Wedding Not Published</h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">This invitation is not available yet.</p>
      </main>
    );
  }

  try {
    await recordInvitationOpen(invitation.partyId);
  } catch (error) {
    console.error(error);
  }

  const fonts = await themeFontsFor(invitation.model.config.id);
  return (
    <div className={fonts}>
      <InvitationView model={invitation.model} reply={invitation.reply} />
    </div>
  );
}
