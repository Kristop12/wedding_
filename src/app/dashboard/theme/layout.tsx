import { themeFontClassName } from "@/themes/fonts";

export default function ThemeSectionLayout({ children }: { children: React.ReactNode }) {
  return <div className={themeFontClassName}>{children}</div>;
}
