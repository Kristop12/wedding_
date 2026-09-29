import type { WeddingMemberRole } from "../../generated/prisma/client";
import { prisma } from "../db/prisma";
import { AccessError } from "../errors";
import { getSession } from "./session";

export async function requireWeddingAccess(
  weddingId: string,
  roles?: WeddingMemberRole[],
) {
  const session = await getSession();

  if (!session) {
    throw new AccessError("UNAUTHORIZED");
  }

  const member = await prisma.weddingMember.findUnique({
    where: {
      weddingId_userId: {
        weddingId,
        userId: session.user.id,
      },
    },
    include: {
      wedding: true,
    },
  });

  if (!member || (roles && !roles.includes(member.role))) {
    throw new AccessError("FORBIDDEN");
  }

  return {
    session,
    member,
    wedding: member.wedding,
  };
}
