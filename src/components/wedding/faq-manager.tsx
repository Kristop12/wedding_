"use client";

import { useActionState } from "react";
import { deleteFaqItemAction, moveFaqItemAction, saveFaqItemAction } from "@/app/dashboard/weddings/actions";
import { Field, FormMessage, controlClassName } from "@/components/wedding/field";
import { SubmitButton } from "@/components/wedding/submit-button";

type FaqItem = { id: string; question: string; answer: string };

export function FaqManager({ weddingId, items }: { weddingId: string; items: FaqItem[] }) {
  return (
    <section className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-medium">Questions</h2>
        <p className="text-muted-foreground text-sm">Answers guests can read on the wedding page.</p>
      </div>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="bg-background ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
            <FaqForm
              weddingId={weddingId}
              faqId={item.id}
              defaults={{ question: item.question, answer: item.answer }}
              submitLabel="Save question"
            />
            <div className="flex flex-wrap gap-2">
              {index > 0 ? (
                <form action={moveFaqItemAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="faqId" value={item.id} />
                  <input type="hidden" name="direction" value="up" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Up
                  </SubmitButton>
                </form>
              ) : null}
              {index < items.length - 1 ? (
                <form action={moveFaqItemAction}>
                  <input type="hidden" name="weddingId" value={weddingId} />
                  <input type="hidden" name="faqId" value={item.id} />
                  <input type="hidden" name="direction" value="down" />
                  <SubmitButton variant="outline" pendingLabel="Moving...">
                    Down
                  </SubmitButton>
                </form>
              ) : null}
              <DeleteFaq weddingId={weddingId} faqId={item.id} />
            </div>
          </li>
        ))}
      </ol>
      <div className="bg-background ring-foreground/10 rounded-xl p-4 ring-1">
        <h3 className="mb-3 font-medium">Add a question</h3>
        <FaqForm weddingId={weddingId} defaults={{ question: "", answer: "" }} submitLabel="Add question" />
      </div>
    </section>
  );
}

function FaqForm({
  weddingId,
  faqId,
  defaults,
  submitLabel,
}: {
  weddingId: string;
  faqId?: string;
  defaults: { question: string; answer: string };
  submitLabel: string;
}) {
  const [state, action] = useActionState(saveFaqItemAction, null);
  const idPrefix = faqId ?? "new-faq";

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="weddingId" value={weddingId} />
      {faqId ? <input type="hidden" name="faqId" value={faqId} /> : null}
      <Field label="Question" htmlFor={`${idPrefix}-question`} error={state?.fieldErrors?.question}>
        <input
          id={`${idPrefix}-question`}
          name="question"
          defaultValue={defaults.question}
          className={controlClassName}
        />
      </Field>
      <Field label="Answer" htmlFor={`${idPrefix}-answer`} error={state?.fieldErrors?.answer}>
        <textarea
          id={`${idPrefix}-answer`}
          name="answer"
          defaultValue={defaults.answer}
          rows={3}
          className={`${controlClassName} h-auto py-2`}
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Saving...">{submitLabel}</SubmitButton>
    </form>
  );
}

function DeleteFaq({ weddingId, faqId }: { weddingId: string; faqId: string }) {
  const [state, action] = useActionState(deleteFaqItemAction, null);
  return (
    <form action={action}>
      <input type="hidden" name="weddingId" value={weddingId} />
      <input type="hidden" name="faqId" value={faqId} />
      <SubmitButton variant="destructive" pendingLabel="Removing...">
        Remove
      </SubmitButton>
      {state && !state.ok ? <span className="text-destructive ml-2 text-xs">{state.message}</span> : null}
    </form>
  );
}
