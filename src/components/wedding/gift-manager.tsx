"use client";

import { useActionState, useState } from "react";
import {
  deleteGiftAccountAction,
  moveGiftAccountAction,
  saveGiftAccountAction,
} from "@/app/dashboard/gifts/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

const GIFT_TYPES = [
  { id: "QRPH", label: "QR Ph" },
  { id: "BANK", label: "Bank" },
  { id: "GCASH", label: "GCash" },
  { id: "MAYA", label: "Maya" },
  { id: "REGISTRY", label: "Registry" },
  { id: "CUSTOM", label: "Custom" },
] as const;

type GiftTypeId = (typeof GIFT_TYPES)[number]["id"];

export type GiftAccountRow = {
  id: string;
  type: GiftTypeId;
  displayName: string;
  accountName: string;
  institutionName: string;
  maskedAccountNumber: string;
  externalUrl: string;
  description: string;
  isEnabled: boolean;
  hasQr: boolean;
};

export function GiftManager({ weddingId, gifts }: { weddingId: string; gifts: GiftAccountRow[] }) {
  return (
    <section className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gifts</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Guests see enabled gifts on their invitation. The public wedding page does not include them. This does not
          process payments.
        </p>
      </div>
      <ol className="space-y-4">
        {gifts.map((gift, index) => (
          <li key={gift.id} className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
            <GiftForm weddingId={weddingId} gift={gift} submitLabel="Save gift" />
            <div className="flex flex-wrap gap-2">
              {index > 0 ? (
                <form action={moveGiftAccountAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="giftId" value={gift.id} />
                  <input type="hidden" name="direction" value="up" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Up
                  </SubmitButton>
                </form>
              ) : null}
              {index < gifts.length - 1 ? (
                <form action={moveGiftAccountAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="giftId" value={gift.id} />
                  <input type="hidden" name="direction" value="down" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Down
                  </SubmitButton>
                </form>
              ) : null}
              <DeleteGift weddingId={weddingId} giftId={gift.id} />
            </div>
          </li>
        ))}
      </ol>
      <div className="bg-background ring-foreground/10 rounded-xl p-4 ring-1">
        <h2 className="mb-3 font-medium">Add a gift</h2>
        <GiftForm
          weddingId={weddingId}
          gift={{
            id: "",
            type: "QRPH",
            displayName: "",
            accountName: "",
            institutionName: "",
            maskedAccountNumber: "",
            externalUrl: "",
            description: "",
            isEnabled: false,
            hasQr: false,
          }}
          submitLabel="Add gift"
        />
      </div>
    </section>
  );
}

function GiftForm({
  weddingId,
  gift,
  submitLabel,
}: {
  weddingId: string;
  gift: GiftAccountRow;
  submitLabel: string;
}) {
  const [state, action] = useActionState(saveGiftAccountAction, null);
  const [type, setType] = useState<GiftTypeId>(gift.type);
  const idPrefix = gift.id || "new-gift";
  const showAccount = type !== "REGISTRY";
  const showInstitution = type === "QRPH" || type === "BANK";
  const showNumber = type === "QRPH" || type === "BANK" || type === "GCASH" || type === "MAYA";
  const showUrl = type === "REGISTRY" || type === "CUSTOM";
  const showQr = type !== "REGISTRY";

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="weddingId" value={weddingId} />
      {gift.id ? <input type="hidden" name="giftId" value={gift.id} /> : null}
      <Field label="Type" htmlFor={`${idPrefix}-type`} error={state?.fieldErrors?.type}>
        <select
          id={`${idPrefix}-type`}
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value as GiftTypeId)}
          className={controlClassName}
        >
          {GIFT_TYPES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Display name" htmlFor={`${idPrefix}-name`} error={state?.fieldErrors?.displayName}>
        <input
          id={`${idPrefix}-name`}
          name="displayName"
          defaultValue={gift.displayName}
          className={controlClassName}
        />
      </Field>
      {showAccount ? (
        <Field label="Account name" htmlFor={`${idPrefix}-account`} error={state?.fieldErrors?.accountName}>
          <input
            id={`${idPrefix}-account`}
            name="accountName"
            defaultValue={gift.accountName}
            className={controlClassName}
          />
        </Field>
      ) : null}
      {showInstitution ? (
        <Field label="Institution" htmlFor={`${idPrefix}-institution`} error={state?.fieldErrors?.institutionName}>
          <input
            id={`${idPrefix}-institution`}
            name="institutionName"
            defaultValue={gift.institutionName}
            className={controlClassName}
            placeholder="BPI"
          />
        </Field>
      ) : null}
      {showNumber ? (
        <Field
          label="Masked account number"
          htmlFor={`${idPrefix}-number`}
          error={state?.fieldErrors?.maskedAccountNumber}
        >
          <input
            id={`${idPrefix}-number`}
            name="maskedAccountNumber"
            defaultValue={gift.maskedAccountNumber}
            className={controlClassName}
            placeholder="****1234"
          />
        </Field>
      ) : null}
      {showUrl ? (
        <Field label="Link" htmlFor={`${idPrefix}-url`} error={state?.fieldErrors?.externalUrl}>
          <input
            id={`${idPrefix}-url`}
            name="externalUrl"
            defaultValue={gift.externalUrl}
            className={controlClassName}
            placeholder="https://"
          />
        </Field>
      ) : null}
      <Field label="Description" htmlFor={`${idPrefix}-description`} error={state?.fieldErrors?.description}>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={gift.description}
          rows={3}
          className={`${controlClassName} h-auto py-2`}
        />
      </Field>
      {showQr ? (
        <Field label="QR image" htmlFor={`${idPrefix}-qr`} error={state?.fieldErrors?.qrImage}>
          {gift.hasQr ? (
            // Dashboard image route checks wedding membership before sending the file.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/dashboard/gifts/qr/${gift.id}`}
              alt=""
              className="mb-2 h-28 w-28 rounded-md object-contain"
            />
          ) : null}
          <input id={`${idPrefix}-qr`} name="qrImage" type="file" accept="image/jpeg,image/png,image/webp" />
        </Field>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isEnabled" value="true" defaultChecked={gift.isEnabled} />
        Show on invitations
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Saving...">{submitLabel}</SubmitButton>
    </form>
  );
}

function DeleteGift({ weddingId, giftId }: { weddingId: string; giftId: string }) {
  const [state, action] = useActionState(deleteGiftAccountAction, null);
  return (
    <form action={action}>
      <input type="hidden" name="weddingId" value={weddingId} />
      <input type="hidden" name="giftId" value={giftId} />
      <SubmitButton variant="destructive" pendingLabel="Removing...">
        Remove
      </SubmitButton>
      {state && !state.ok ? <span className="text-destructive ml-2 text-xs">{state.message}</span> : null}
    </form>
  );
}
