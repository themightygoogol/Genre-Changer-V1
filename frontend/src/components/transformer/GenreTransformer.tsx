import type { ReactNode } from "react";
import { themeVariables, type GenreTheme } from "./themes/genreThemes";
import "./GenreTransformer.css";
import type { DockPhase } from "./docking";
import VinylBackground from "./VinylBackground";

interface GenreTransformerProps {
  theme: GenreTheme;
  state: string;
  dockPhase?: DockPhase;
  children: ReactNode;
}

export default function GenreTransformer({
  theme,
  state,
  dockPhase = "idle",
  children,
}: GenreTransformerProps) {
  return (
    <main
      className={`transform-page genre-transformer genre-${theme.id} state-${state} dock-${dockPhase}`}
      style={themeVariables(theme)}
    >
      <VinylBackground />
      <div className="drill-page-title">
        {theme.label.toUpperCase()} TRANSFORMER
      </div>
      {children}
    </main>
  );
}
