import { z } from "zod";

const GIFT_TYPES = ["QRPH", "BANK", "GCASH", "MAYA", "REGISTRY", "CUSTOM"] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const optionalHttps = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || isHttps(value), { message: "Use an https link." });

export const giftAccountSchema = z
  .object({
    giftId: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || null),
    type: z.enum(GIFT_TYPES),
    displayName: z.string().trim().min(1, "Enter a display name.").max(120),
    accountName: optionalText(160),
    institutionName: optionalText(160),
    maskedAccountNumber: optionalText(32).refine(
      (value) => value === null || /^[0-9A-Za-z* .\-]+$/.test(value),
      { message: "Use letters, numbers, spaces, or * for a masked number." },
    ),
    externalUrl: optionalHttps,
    description: optionalText(2000),
    isEnabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "REGISTRY" && !value.externalUrl) {
      ctx.addIssue({ code: "custom", path: ["externalUrl"], message: "Add the registry link." });
    }
    if (value.type === "BANK") {
      requireField(ctx, value.accountName, "accountName", "Enter the account name.");
      requireField(ctx, value.institutionName, "institutionName", "Enter the bank name.");
      requireField(ctx, value.maskedAccountNumber, "maskedAccountNumber", "Enter the masked account number.");
    }
    if (value.type === "GCASH" || value.type === "MAYA") {
      requireField(ctx, value.accountName, "accountName", "Enter the account name.");
      requireField(ctx, value.maskedAccountNumber, "maskedAccountNumber", "Enter the masked account number.");
    }
  });

export type GiftAccountInput = z.infer<typeof giftAccountSchema>;

function requireField(
  ctx: z.RefinementCtx,
  value: string | null,
  path: string,
  message: string,
) {
  if (!value) {
    ctx.addIssue({ code: "custom", path: [path], message });
  }
}

function isHttps(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function fieldErrorsFromZod(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}
