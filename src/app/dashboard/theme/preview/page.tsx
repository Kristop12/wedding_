import { PreviewShell } from "@/components/theme/preview-shell";
import { NoWedding } from "@/components/wedding/no-wedding";
import { toThemeSource } from "@/lib/weddings/theme-source";
import { loadThemeWorkspace } from "@/lib/weddings/queries";
import { isThemeId } from "@/themes/registry";
import { buildThemeViewModel } from "@/themes/view-model";

export default async function ThemePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const workspace = await loadThemeWorkspace();
  if (!workspace) {
    return <NoWedding title="Theme preview" />;
  }

  const query = await searchParams;
  const themeId = isThemeId(query.theme) ? query.theme : workspace.wedding.themeId;
  const model = buildThemeViewModel(toThemeSource(workspace.wedding), themeId);

  return <PreviewShell model={model} />;
}
