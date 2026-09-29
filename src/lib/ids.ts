import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export const createPublicId = customAlphabet(alphabet, 16);
export const createInviteToken = customAlphabet(alphabet, 12);
