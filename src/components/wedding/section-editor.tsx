import { moveSectionAction, toggleSectionAction } from "@/app/dashboard/weddings/actions";
import { SubmitButton } from "@/components/wedding/submit-button";
import { SECTION_LABELS } from "@/lib/weddings/constants";
import type { SectionType } from "@/generated/prisma/client";

export function SectionEditor({
  weddingId,
  sections,
}: {
  weddingId: string;
  sections: { id: string; type: SectionType; enabled: boolean }[];
}) {
  return (
    <ol className="bg-background ring-foreground/10 divide-y rounded-xl ring-1">
      {sections.map((section, index) => (
        <li key={section.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-medium">{SECTION_LABELS[section.type]}</p>
            <p className="text-muted-foreground text-xs">{section.enabled ? "Shown" : "Hidden"}</p>
          </div>
          <div className="flex items-center gap-2">
            {index > 0 ? (
              <form action={moveSectionAction}>
                <input type="hidden" name="weddingId" value={weddingId} />
                <input type="hidden" name="sectionId" value={section.id} />
                <input type="hidden" name="direction" value="up" />
                <SubmitButton variant="outline" pendingLabel="Moving...">
                  Up
                </SubmitButton>
              </form>
            ) : null}
            {index < sections.length - 1 ? (
              <form action={moveSectionAction}>
                <input type="hidden" name="weddingId" value={weddingId} />
                <input type="hidden" name="sectionId" value={section.id} />
                <input type="hidden" name="direction" value="down" />
                <SubmitButton variant="outline" pendingLabel="Moving...">
                  Down
                </SubmitButton>
              </form>
            ) : null}
            <form action={toggleSectionAction}>
              <input type="hidden" name="weddingId" value={weddingId} />
              <input type="hidden" name="sectionId" value={section.id} />
              <input type="hidden" name="enabled" value={section.enabled ? "false" : "true"} />
              <SubmitButton variant="secondary" pendingLabel="Saving...">
                {section.enabled ? "Hide" : "Show"}
              </SubmitButton>
            </form>
            <span className="text-muted-foreground w-6 text-right text-xs">{index + 1}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
