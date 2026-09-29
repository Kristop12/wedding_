import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NoWedding({ title }: { title: string }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="bg-background ring-foreground/10 max-w-xl rounded-xl p-6 ring-1">
        <h2 className="text-base font-medium">Create a wedding first</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Partner names, the date, events, and guests are added from the setup
          wizard.
        </p>
        <Link href="/dashboard/weddings/new" className={cn(buttonVariants(), "mt-4")}>
          Create your wedding
        </Link>
      </div>
    </section>
  );
}
