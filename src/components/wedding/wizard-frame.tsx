import Link from "next/link";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStep } from "@/lib/weddings/constants";

export function WizardFrame({
  weddingId,
  step,
  children,
}: {
  weddingId?: string;
  step: WizardStep;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Set up your wedding</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Save each step. You can come back and change it later.
        </p>
      </div>
      <ol className="flex gap-2 overflow-x-auto pb-1">
        {WIZARD_STEPS.map((item, index) => {
          const active = item.id === step;
          const href = weddingId
            ? `/dashboard/weddings/${weddingId}/setup?step=${item.id}`
            : undefined;
          const className = cn(
            "shrink-0 rounded-full px-3 py-1 text-sm",
            active ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
          );

          return (
            <li key={item.id}>
              {href ? (
                <Link href={href} className={className} aria-current={active ? "step" : undefined}>
                  {index + 1}. {item.label}
                </Link>
              ) : (
                <span className={className} aria-current={active ? "step" : undefined}>
                  {index + 1}. {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {children}
    </section>
  );
}
