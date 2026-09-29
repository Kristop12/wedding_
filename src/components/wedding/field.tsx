import { cn } from "@/lib/utils";

export const controlClassName =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3";

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

export function FormMessage({
  state,
}: {
  state: { ok: boolean; message?: string; fieldErrors?: Record<string, string> } | null;
}) {
  if (!state?.message && !state?.fieldErrors) {
    return null;
  }

  const details = state?.fieldErrors ? Object.values(state.fieldErrors) : [];

  return (
    <div
      role={state?.ok ? "status" : "alert"}
      className={cn("space-y-1 text-sm", state?.ok ? "text-muted-foreground" : "text-destructive")}
    >
      {state?.message ? <p>{state.message}</p> : null}
      {state?.ok
        ? null
        : details.map((detail) => (
            <p key={detail}>{detail}</p>
          ))}
    </div>
  );
}
