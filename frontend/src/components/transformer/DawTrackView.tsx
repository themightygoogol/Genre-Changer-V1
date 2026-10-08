import { useMemo, type CSSProperties } from "react";
import type { MidiTrackInfo } from "../../music/types";
import "./DawTrackView.css";
import { instrumentColor } from "../../music/analysis/instrumentColors";

interface DawTrackViewProps {
  tracks: MidiTrackInfo[];
  progress?: number;
  showPlayhead?: boolean;
}

function getDuration(tracks: MidiTrackInfo[]) {
  return Math.max(
    1,
    ...tracks.flatMap((track) =>
      track.notes.map((note) => note.time + note.duration),
    ),
  );
}

export default function DawTrackView({
  tracks,
  progress = 0,
  showPlayhead = false,
}: DawTrackViewProps) {
  const duration = useMemo(() => getDuration(tracks), [tracks]);

  const timeline = Array.from({ length: 9 }, (_, index) => ({
    left: `${(index / 8) * 100}%`,
    label: `${((duration * index) / 8).toFixed(1)}s`,
  }));

  return (
    <div className="daw-shell">
      <div className="daw-timeline">
        <div className="daw-track-spacer" />

        <div className="daw-timeline-ruler">
          {timeline.map((tick) => (
            <span
              key={tick.left}
              style={{
                left: tick.left,
              }}
            >
              {tick.label}
            </span>
          ))}

          {showPlayhead && (
            <div
              className="daw-timeline-playhead"
              style={{
                left: `${progress * 100}%`,
              }}
            />
          )}
        </div>
      </div>

      <div className="daw-lanes">
        {tracks.map((track) => (
          <div
            className="daw-row"
            key={track.trackIndex}
            style={
              { "--track-color": instrumentColor(track).color } as CSSProperties
            }
          >
            <div className="daw-track-label">
              <strong>{track.name}</strong>

              <span
                title={`${instrumentColor(track).label} · ${track.instrumentName}`}
              >
                {track.instrumentName}
              </span>
            </div>

            <div className="daw-lane">
              {timeline.map((tick) => (
                <i
                  className="daw-grid-line"
                  key={`grid-${tick.left}`}
                  style={{
                    left: tick.left,
                  }}
                />
              ))}

              {track.notes.map((note, noteIndex) => {
                const left = (note.time / duration) * 100;

                const width = Math.max((note.duration / duration) * 100, 0.35);

                return (
                  <span
                    className="daw-note"
                    key={`${note.time}-${note.midi}-${noteIndex}`}
                    title={`${note.name} • ${note.time.toFixed(
                      2,
                    )}s • ${note.duration.toFixed(2)}s`}
                    style={{
                      left: `${left}%`,
                      width: `${Math.min(width, 100 - left)}%`,
                      opacity: Math.max(0.45, note.velocity),
                    }}
                  />
                );
              })}

              {showPlayhead && (
                <div
                  className="daw-playhead"
                  style={{
                    left: `${progress * 100}%`,
                  }}
                >
                  <span />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
