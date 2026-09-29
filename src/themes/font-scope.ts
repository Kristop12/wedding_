export async function themeFontsFor(themeId: string) {
  if (themeId === "rustic") {
    const fonts = await import("./fonts/rustic");
    return fonts.rusticFontClassName;
  }
  const fonts = await import("./fonts/sketches");
  return fonts.sketchFontClassName;
}
