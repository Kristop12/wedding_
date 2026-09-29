import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  { title: "Personal invitations", body: "Each party gets a private link. Guests do not need an account." },
  { title: "Guest list", body: "Parties, seats, groups, and a table you can filter." },
  { title: "RSVP", body: "Accept or decline, with meals, dietary notes, and a message." },
  { title: "Private gifts", body: "QR Ph and other gift details stay on the invitation, not the public page." },
];

const steps = [
  { title: "Set up the wedding", body: "Names, date, Rustic theme, and the ceremony and reception." },
  { title: "Invite guests", body: "Add parties and copy each invitation link." },
  { title: "Publish", body: "Guests open the envelope, read the details, and reply." },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <p className="text-sm font-semibold tracking-tight">Wedding</p>
        <Link href="/login" className="text-sm underline-offset-4 hover:underline">
          Log in
        </Link>
      </header>
      <main id="content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-16">
        <section className="py-12 sm:py-20">
          <p className="text-muted-foreground text-sm font-medium">Wedding invitations</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            A digital invitation your guests can open from a link.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7">
            Create a wedding, publish a personal invitation, and collect replies from a dashboard you can install.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Create Your Wedding
            </Link>
            <Link href="/w/kent-and-maria" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              View Demo
            </Link>
          </div>
        </section>

        <section className="border-t py-12" aria-labelledby="features-title">
          <h2 id="features-title" className="text-xl font-semibold tracking-tight">
            Features
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.title} className="bg-background ring-foreground/10 rounded-xl p-5 ring-1">
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t py-12" aria-labelledby="theme-title">
          <h2 id="theme-title" className="text-xl font-semibold tracking-tight">
            Theme preview
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
            Rustic, Elegant, Modern, and Tropical each open with their own invitation.
          </p>
          <div className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F7F1E8] px-5 py-8 text-center text-[#332D29]">
              <p className="text-xs tracking-[0.22em] uppercase text-[#6F5141]">Rustic</p>
              <p className="mt-3 text-2xl text-[#B86F52]">Kent & Maria</p>
            </div>
            <div className="bg-[#FBF8F4] px-5 py-8 text-center text-[#1F1A17] ring-1 ring-[#A68B5B]/40">
              <p className="text-xs tracking-[0.22em] uppercase text-[#A68B5B]">Elegant</p>
              <p className="mt-3 text-2xl tracking-wide">Kent & Maria</p>
            </div>
            <div className="bg-[#F4F4F5] px-5 py-8 text-center text-[#18181B]">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#71717A]">Modern</p>
              <p className="mt-3 text-2xl tracking-tight">Kent & Maria</p>
            </div>
            <div className="rounded-3xl bg-[#FFF8F0] px-5 py-8 text-center text-[#243028]">
              <p className="text-xs tracking-[0.22em] uppercase text-[#D4765A]">Tropical</p>
              <p className="mt-3 text-2xl text-[#2F6F4E]">Kent & Maria</p>
            </div>
          </div>
        </section>

        <section className="border-t py-12" aria-labelledby="how-title">
          <h2 id="how-title" className="text-xl font-semibold tracking-tight">
            How it works
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <p className="text-muted-foreground text-xs tracking-wide">0{index + 1}</p>
                <h3 className="mt-1 font-medium">{step.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-8 border-t py-12 md:grid-cols-3">
          <article>
            <h2 className="font-medium">QR Ph gifts</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Couples upload their own QR image. Guests can save it from the invitation. The app does not process
              payments, and the public page does not show gift details.
            </p>
          </article>
          <article>
            <h2 className="font-medium">RSVP</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Guests reply from their own link. The dashboard shows who accepted, who declined, and how many people are
              coming.
            </p>
          </article>
          <article>
            <h2 className="font-medium">Installable dashboard</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Couples can install the dashboard on a phone. Guests open a normal link and are not asked to install
              anything.
            </p>
          </article>
        </section>

        <section className="border-t py-12" aria-labelledby="pricing-title">
          <h2 id="pricing-title" className="text-xl font-semibold tracking-tight">
            Pricing
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">Pricing is not available yet.</p>
        </section>

        <section className="border-t py-12">
          <h2 className="text-2xl font-semibold tracking-tight">Start with your names and a date.</h2>
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
            Create Your Wedding
          </Link>
        </section>
      </main>
      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-6 text-sm sm:flex-row sm:justify-between">
          <p>Wedding</p>
          <p>Guests never need an account.</p>
        </div>
      </footer>
    </div>
  );
}
