"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dashboardNav,
  isNavItemActive,
  mobileMoreNav,
  mobilePrimaryNav,
} from "@/components/dashboard/nav";
import { InstallPrompt } from "@/components/dashboard/install-prompt";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type DashboardUser = {
  name: string;
  email: string;
};

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const moreActive = mobileMoreNav.some((item) =>
    isNavItemActive(pathname, item),
  );

  return (
    <div className="bg-muted/40 min-h-full">
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <div className="mx-auto flex min-h-full w-full max-w-7xl">
        <aside className="bg-background sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r md:flex">
          <div className="px-5 py-5">
            <Link
              href="/dashboard"
              className="text-sm font-semibold tracking-tight"
            >
              Wedding
            </Link>
            <p className="text-muted-foreground mt-1 text-xs">
              Couple dashboard
            </p>
          </div>
          <nav
            className="flex flex-1 flex-col gap-1 px-3"
            aria-label="Dashboard"
          >
            {dashboardNav.map((item) => {
              const active = isNavItemActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    active && "bg-muted text-foreground font-medium",
                  )}
                >
                  <Icon />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-3">
            <UserMenu user={user} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <InstallPrompt />
          <header className="bg-background flex items-center justify-between border-b px-4 py-3 md:hidden">
            <Link href="/dashboard" className="text-sm font-semibold">
              Wedding
            </Link>
            <UserMenu user={user} compact />
          </header>
          <main id="dashboard-content" className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">
            {children}
          </main>
        </div>
      </div>

      <nav
        className="bg-background fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
        aria-label="Dashboard"
      >
        <ul className="grid grid-cols-4">
          {mobilePrimaryNav.map((item) => {
            const active = isNavItemActive(pathname, item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-muted-foreground flex flex-col items-center gap-1 px-2 py-2 text-[11px]",
                    active && "text-foreground",
                  )}
                >
                  <Icon />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-muted-foreground h-auto w-full flex-col gap-1 rounded-none px-2 py-2 text-[11px]",
                      moreActive && "text-foreground",
                    )}
                  />
                }
              >
                <Menu />
                More
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80dvh]">
                <SheetHeader>
                  <SheetTitle>More</SheetTitle>
                </SheetHeader>
                <div className="grid gap-1 px-4 pb-6">
                  {mobileMoreNav.map((item) => {
                    const active = isNavItemActive(pathname, item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-3 text-sm",
                          active && "bg-muted text-foreground font-medium",
                        )}
                      >
                        <Icon />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>
    </div>
  );
}
