import HardwareScrews from "../HardwareScrews";
import LoopPreviewCredit from "./LoopPreviewCredit";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { genreNotes } from "./genreNotes";
import { genrePaperImages } from "./genrePaperImages";
import { genreDeckPalette } from "./genreDeckPalette";
import PreviewWaveform from "./PreviewWaveform";
import "./StudioHome.css";

export default function DeckInfoScreen({
  selectedGenre,
}: {
  selectedGenre: string | null;
}) {
  const displayRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const display = displayRef.current;
    const fit = fitRef.current;
    if (!display || !fit) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const padding = getComputedStyle(display);
      const height =
        display.clientHeight -
        parseFloat(padding.paddingTop) -
        parseFloat(padding.paddingBottom);
      const content = fit.firstElementChild as HTMLElement | null;
      const naturalHeight = content
        ? Math.max(content.offsetHeight, content.scrollHeight)
        : 0;
      fit.style.transform = `scale(${naturalHeight > 0 ? Math.min(1, Math.max(0, height) / naturalHeight) : 1})`;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(display);
    display.addEventListener("load", measure, true);
    document.fonts.ready.then(measure);
    measure();
    return () => {
      alive = false;
      observer.disconnect();
      display.removeEventListener("load", measure, true);
    };
  }, [selectedGenre]);
  const note = selectedGenre ? genreNotes[selectedGenre] : null;
  const colour = selectedGenre ? genreDeckPalette[selectedGenre] : null;
  const style = {
    "--terminal-accent": colour?.color ?? "#b8a0ff",
    "--venue-light-rgb": colour?.rgb ?? "167, 139, 250",
  } as CSSProperties;
  return (
    <section
      className="venue-screen-slot"
      data-genre={selectedGenre ?? ""}
      style={style}
      aria-label="Genre information screen"
    >
      {selectedGenre && (
        <div key={selectedGenre} className="venue-light-cue" aria-hidden="true">
          <i />
          <i />
        </div>
      )}
      <div className="deck-screen-extension">
        <HardwareScrews variant="screen" />
        <header className="deck-screen-label">
          <span>GENRE TERMINAL AND DECK</span>
          <LoopPreviewCredit genreId={selectedGenre} />
        </header>
        <div className="deck-screen-bezel">
          <div className="deck-screen-display" ref={displayRef}>
            <div className="terminal-content-fit" ref={fitRef}>
              <div
                key={selectedGenre ?? "welcome"}
                className="terminal-page"
                aria-live="polite"
              >
                {note ? (
                  <>
                    <div className="terminal-genre-heading">
                      <span className="terminal-code">
                        SYS.PROFILE / {selectedGenre?.toUpperCase()}
                      </span>
                      <h1>&gt; {note.name}</h1>
                    </div>
                    <div className="terminal-summary">
                      <p>{note.description}</p>
                      {selectedGenre && genrePaperImages[selectedGenre] && (
                        <figure>
                          <img
                            src={genrePaperImages[selectedGenre]}
                            alt={`${note.name} artwork`}
                          />
                        </figure>
                      )}
                    </div>
                    <div className="terminal-profile-grid">
                      <section>
                        <h2>ORIGINS</h2>
                        <p>{note.history}</p>
                      </section>
                      <section>
                        <h2>SIGNATURE SOUND</h2>
                        <ul>
                          {note.characteristics.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    </div>
                    <a
                      className="terminal-source"
                      href={note.source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {note.source.label} ↗
                    </a>
                  </>
                ) : (
                  <>
                    <span className="terminal-code">
                      SYS.READY / AWAITING INPUT
                    </span>
                    <h1>&gt; MIDI SHIFT</h1>
                    <p className="terminal-welcome-description">
                      A tool to explore various genres and reshape an existing
                      MIDI arrangement. These transofmers rebuild melodies,
                      music structure, and more to fit the music theory of the
                      selected genre. Track these changes with logs generated
                      during the transformation. Download these results to keep
                      creating in your DAW.
                    </p>
                    <blockquote className="terminal-poem">
                      "There once was a listener, snug in his chair,
                      <br />
                      Who scoffed at the sounds drifting in from elsewhere.
                      <br />
                      “One sound is enough!” he declared with a grin.
                      <br />
                      “No strange little rhythms are getting within!”
                      <br />
                      Then round went his record, and round went his feet—
                      <br />
                      Till he wore through the floor to the very same beat.
                      <br />
                      So try something strange; let a new rhythm in.
                      <br />A world full of music is waiting to spin."
                    </blockquote>
                    <p>- Dr. Seuss probably</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <footer className="deck-screen-footer">
          <PreviewWaveform />
        </footer>
      </div>
    </section>
  );
}
