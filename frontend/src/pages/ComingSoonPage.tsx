import { genreDeckPalette } from "../components/home/genreDeckPalette";
import "./ComingSoonTheme.css";
import { useEffect } from "react";
import GenreTransformer from "../components/transformer/GenreTransformer";
import { genreThemes } from "../components/transformer/themes/genreThemes";
import MidiMachine from "../components/MidiMachine";
import FitPanel from "../components/transformer/FitPanel";
import "./ComingSoonPage.css";

const idleAction = () => {};

export default function ComingSoonPage({ genre }: { genre: string }) {
  const id = genre.toLowerCase().replace(/[^a-z]/g, "");
  const baseTheme =
    id === "metal"
      ? genreThemes.metal
      : id === "house"
        ? genreThemes.house
        : genreThemes.lofi;
  const colour = genreDeckPalette[id];
  const theme = colour
    ? {
        ...baseTheme,
        accent: colour.color,
        strong: colour.color,
        deep: colour.color,
        rgb: colour.rgb,
      }
    : baseTheme;
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <GenreTransformer theme={theme} state="idle" dockPhase="idle">
      <section
        className="workspace-stage construction-workspace"
        aria-label={`${theme.label} engine under construction`}
      >
        <div className="construction-fit-viewport">
          <FitPanel expanded>
            <section
              className="construction-hologram"
              aria-label={`${theme.label} transformer under construction`}
            >
              <span className="construction-hologram-code">
                MIDI SHIFT / ENGINE STATUS
              </span>
              <h1>{theme.label} under construction</h1>
              <p>
                This genre engine is being built. Transformation, playback and
                file loading are offline.
              </p>
              <div className="construction-hologram-tape">
                UNDER CONSTRUCTION · ENGINE OFFLINE
              </div>
              <span className="construction-hologram-return">
                Press the website logo to return to the record deck.
              </span>
              <div className="construction-hologram-beam" aria-hidden="true" />
            </section>
            <div className="construction-machine" inert aria-hidden="true">
              <MidiMachine
                title={`${theme.label} Transformer`}
                fileName={null}
                state="idle"
                controlsDisabled
                onTransform={idleAction}
                onDownload={idleAction}
                onClearFile={idleAction}
              />
            </div>
          </FitPanel>
        </div>
      </section>
    </GenreTransformer>
  );
}
