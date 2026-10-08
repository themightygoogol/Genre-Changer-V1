import type { CSSProperties } from "react";

export interface GenreTheme {
  id: string;
  label: string;
  accent: string;
  strong: string;
  deep: string;
  rgb: string;
}

export const genreThemes = {
  drill: {
    id: "drill",
    label: "Drill",
    accent: "#58d8ff",
    strong: "#a3ebff",
    deep: "#27b7e8",
    rgb: "88, 216, 255",
  },
  metal: {
    id: "metal",
    label: "Metal",
    accent: "#76de99",
    strong: "#b7f3cc",
    deep: "#40b968",
    rgb: "118, 222, 153",
  },
  lofi: {
    id: "lofi",
    label: "Lo-Fi",
    accent: "#f4d46a",
    strong: "#fff0ae",
    deep: "#d7b33d",
    rgb: "244, 212, 106",
  },
  house: {
    id: "house",
    label: "House",
    accent: "#ffad75",
    strong: "#ffd7bd",
    deep: "#df834a",
    rgb: "255, 173, 117",
  },
} satisfies Record<string, GenreTheme>;

export function themeVariables(theme: GenreTheme): CSSProperties {
  return {
    "--accent": theme.accent,
    "--accent-strong": theme.strong,
    "--accent-deep": theme.deep,
    "--accent-rgb": theme.rgb,
    "--system-accent": theme.accent,
  } as CSSProperties;
}
