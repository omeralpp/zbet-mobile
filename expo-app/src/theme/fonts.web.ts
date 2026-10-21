import { useEffect, useState } from "react";
import { Asset } from "expo-asset";

/**
 * Registers the bundled faces with the browser under the same family names
 * Android uses, one FontFace per weight, so `fontFamily` plus `fontWeight`
 * means the same thing on both surfaces.
 *
 * expo-font cannot do this: its web loader registers one face per name, with no
 * weight descriptor. The launch screen waits for these faces so a screen never
 * paints in a fallback and then jumps; a face that fails or stalls releases the
 * wait after `fontWaitMs` and the fallback stack takes over.
 */
const faces = [
  ["Manrope", "400", require("../../assets/fonts/Manrope-Regular.ttf")],
  ["Manrope", "500", require("../../assets/fonts/Manrope-Medium.ttf")],
  ["Manrope", "700", require("../../assets/fonts/Manrope-Bold.ttf")],
  ["Manrope", "800", require("../../assets/fonts/Manrope-ExtraBold.ttf")],
  ["BarlowCondensed", "500", require("../../assets/fonts/BarlowCondensed-Medium.ttf")],
  ["BarlowCondensed", "700", require("../../assets/fonts/BarlowCondensed-Bold.ttf")],
  ["BarlowCondensed", "800", require("../../assets/fonts/BarlowCondensed-ExtraBold.ttf")]
] as const;

const fontWaitMs = 2500;
let loading: Promise<void> | null = null;

function loadBrandFonts(): Promise<void> {
  if (!loading) {
    loading = Promise.all(
      faces.map(async ([family, weight, source]) => {
        const face = new FontFace(
          family,
          `url(${Asset.fromModule(source).uri}) format("truetype")`,
          { weight, style: "normal", display: "swap" }
        );
        document.fonts.add(await face.load());
      })
    ).then(() => undefined);
  }
  return loading;
}

export function useBrandFonts(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const release = () => {
      if (active) {
        setReady(true);
      }
    };
    const timeout = setTimeout(release, fontWaitMs);
    loadBrandFonts()
      .catch(() => undefined)
      .finally(() => {
        clearTimeout(timeout);
        release();
      });
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);
  return ready;
}
