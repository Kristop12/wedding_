"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardUser = {
  name: string;
  email: string;
};

export function UserMenu({
  user,
  compact = false,
}: {
  user: DashboardUser;
  compact?: boolean;
}) {
  const router = useRouter();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function logout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={
              compact
                ? "size-8 rounded-full px-0"
                : "h-auto w-full justify-start px-2 py-2"
            }
            size={compact ? "icon" : "default"}
          />
        }
      >
        <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
          {initials || "U"}
        </span>
        {compact ? null : (
          <span className="min-w-0 text-left">
            <span className="block truncate text-sm font-medium">
              {user.name}
            </span>
            <span className="text-muted-foreground block truncate text-xs">
              {user.email}
            </span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="text-foreground block text-sm font-medium">
              {user.name}
            </span>
            <span className="block truncate text-xs font-normal">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void logout()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
