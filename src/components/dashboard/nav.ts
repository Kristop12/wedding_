import {
  CalendarDays,
  ClipboardList,
  Gift,
  Heart,
  Images,
  LayoutDashboard,
  Palette,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const dashboardNav: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/dashboard/wedding", label: "Wedding", icon: Heart },
  { href: "/dashboard/theme", label: "Theme", icon: Palette },
  { href: "/dashboard/guests", label: "Guests", icon: Users },
  { href: "/dashboard/rsvp", label: "RSVP", icon: ClipboardList },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/gallery", label: "Gallery", icon: Images },
  { href: "/dashboard/gifts", label: "Gifts", icon: Gift },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const mobilePrimaryNav = dashboardNav.filter((item) =>
  ["/dashboard", "/dashboard/guests", "/dashboard/rsvp"].includes(item.href),
);

export const mobileMoreNav = dashboardNav.filter(
  (item) => !mobilePrimaryNav.some((primary) => primary.href === item.href),
);

export function isNavItemActive(pathname: string, item: DashboardNavItem) {
  if (item.href === "/dashboard/wedding") {
    return (
      pathname === item.href ||
      pathname.startsWith("/dashboard/wedding/") ||
      pathname.startsWith("/dashboard/weddings")
    );
  }

  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
