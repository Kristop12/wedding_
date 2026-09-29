import Link from "next/link";
import { ThemeSettingsForm } from "@/components/theme/theme-settings-form";
import { NoWedding } from "@/components/wedding/no-wedding";
import { ThemePicker } from "@/components/wedding/theme-picker";
import { WEDDING_THEMES } from "@/lib/weddings/constants";
import { toThemeSource } from "@/lib/weddings/theme-source";
import { loadThemeWorkspace } from "@/lib/weddings/queries";
import { getThemeConfig } from "@/themes/registry";
import { buildThemeViewModel } from "@/themes/view-model";

export default async function ThemePage() {
  const workspace = await loadThemeWorkspace();
  if (!workspace) {
    return <NoWedding title="Theme" />;
  }

  const model = buildThemeViewModel(toThemeSource(workspace.wedding));
  const swatches = Object.fromEntries(
    WEDDING_THEMES.map((theme) => {
      const config = theme.id === model.config.id ? model.config : getThemeConfig(theme.id);
      return [
        theme.id,
        {
          background: config.colors.background,
          primary: config.colors.primary,
          accent: config.colors.accent,
          text: config.colors.text,
        },
      ];
    }),
  );

  return (
    <section className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Theme</h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Rustic is the complete invitation. Elegant, Modern, and Tropical can be selected now.
            Their full designs come later.
          </p>
        </div>
        <Link href="/dashboard/theme/preview" className="text-sm underline">
          Open full preview
        </Link>
      </div>
      <ThemePicker
        weddingId={workspace.wedding.id}
        themeId={workspace.wedding.themeId}
        swatches={swatches}
        submitLabel="Save theme"
      />
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Theme settings</h2>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Colors and fonts apply to the selected theme. Choosing a different theme restores that
            theme&apos;s default palette. The envelope and wax seal stay as you set them.
          </p>
        </div>
        <ThemeSettingsForm
          weddingId={workspace.wedding.id}
          defaults={{
            primaryColor: model.config.colors.primary,
            accentColor: model.config.colors.accent,
            headingFont: model.config.typography.heading,
            bodyFont: model.config.typography.body,
            scriptFont: model.config.typography.script,
            envelopeStyle: model.config.invitation.envelopeStyle,
            sealInitials: model.sealInitials,
            musicEnabled: model.musicEnabled,
            musicUrl: model.musicUrl ?? "",
          }}
        />
      </div>
    </section>
  );
}
