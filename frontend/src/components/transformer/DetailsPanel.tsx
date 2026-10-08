import HardwareScrews from "../HardwareScrews";
import { useMemo, useState } from "react";
import "./DetailsPanel.css";
import type { MidiTrackInfo } from "../../music/types";
import { detectKey } from "../../music/analysis/detectKeys";
import {
  formatTransformationLog,
  type TransformationLog,
} from "../../music/transformationLog";

interface DetailsPanelProps {
  fileName: string | null;
  bpm: number;
  originalTracks: MidiTrackInfo[];
  transformedTracks: MidiTrackInfo[];
  transformationComplete: boolean;
  log: TransformationLog | null;
}
const noteCount = (tracks: MidiTrackInfo[]) =>
  tracks.reduce((sum, track) => sum + track.notes.length, 0);
const duration = (tracks: MidiTrackInfo[]) =>
  tracks.reduce(
    (end, track) =>
      track.notes.reduce(
        (latest, note) => Math.max(latest, note.time + note.duration),
        end,
      ),
    0,
  );

export default function DetailsPanel({
  fileName,
  bpm,
  originalTracks,
  transformedTracks,
  transformationComplete,
  log,
}: DetailsPanelProps) {
  const [view, setView] = useState<"overview" | "log">("overview");
  const [stageIndex, setStageIndex] = useState(0);
  const [trackPage, setTrackPage] = useState(0);
  const detected = useMemo(
    () => (originalTracks.length ? detectKey(originalTracks) : null),
    [originalTracks],
  );
  const stage = log?.stages[stageIndex];
  const totalPages = Math.max(1, Math.ceil(originalTracks.length / 3));

  function downloadLog(format: "txt" | "json") {
    if (!log) return;
    const text =
      format === "json"
        ? JSON.stringify(log, null, 2)
        : formatTransformationLog(log);
    const url = URL.createObjectURL(
      new Blob([text], {
        type:
          format === "json" ? "application/json" : "text/plain;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(fileName ?? "midi").replace(/\.(mid|midi)$/i, "")}-drill-log.${format}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="instrument-panel details-panel">
      <HardwareScrews />
      <header className="instrument-panel-header">
        <div>
          <span className="panel-kicker">DRILL ANALYSIS & AUDIT</span>
          <h2>Details</h2>
        </div>
        <div className="segment-control">
          <button
            type="button"
            className={view === "overview" ? "active" : ""}
            onClick={() => setView("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={view === "log" ? "active" : ""}
            disabled={!log}
            onClick={() => setView("log")}
          >
            Step log
          </button>
        </div>
      </header>
      <div className="details-file" title={fileName ?? undefined}>
        {fileName ?? "Load a MIDI to inspect its arrangement."}
      </div>
      <div className="details-body">
        {view === "overview" ? (
          <>
            <div className="details-grid">
              {[
                ["DETECTED KEY", detected?.name ?? "—"],
                ["TARGET", log?.targetKey ?? "Run transform"],
                ["TEMPO", `${Math.round(bpm)} BPM`],
                ["LENGTH", `${duration(originalTracks).toFixed(1)}s`],
                [
                  "TRACKS · IN → OUT",
                  `${originalTracks.length} → ${transformationComplete ? transformedTracks.length : "—"}`,
                ],
                [
                  "NOTES · IN → OUT",
                  `${noteCount(originalTracks)} → ${transformationComplete ? noteCount(transformedTracks) : "—"}`,
                ],
              ].map(([label, value]) => (
                <div className="detail-cell" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <p className="details-explanation">
              {log
                ? "Open the step log for the exact recipe, including unchanged and skipped steps. Download the full audit for every note and pitch bend before and after."
                : "Key detection is an estimate. Run the transformer to see which pitches, percussion and bass events actually change."}
            </p>
            <div className="details-track-list">
              {originalTracks
                .slice(trackPage * 3, trackPage * 3 + 3)
                .map((track) => {
                  const removed =
                    track.channel === 9 || track.instrumentFamily === "drums";
                  const bass = log?.sourceBassTrackIndex === track.trackIndex;
                  const tonal = log?.stages
                    .find((item) => item.id === "tonality")
                    ?.changes.find(
                      (change) => change.sourceTrackIndex === track.trackIndex,
                    );
                  const changed =
                    tonal?.after?.notes.filter(
                      (note, index) =>
                        note.midi !== tonal.before?.notes[index]?.midi,
                    ).length ?? 0;
                  return (
                    <div className="details-track-row" key={track.trackIndex}>
                      <strong title={track.name}>{track.name}</strong>
                      <span>
                        {!log
                          ? `${track.notes.length} input notes`
                          : removed
                            ? "Removed percussion"
                            : bass
                              ? `Rebuilt as 808 · ${changed} tonal shifts`
                              : `${changed} pitches lowered · timing retained`}
                      </span>
                    </div>
                  );
                })}
            </div>
            {totalPages > 1 && (
              <div className="details-pagination">
                <button
                  type="button"
                  disabled={trackPage === 0}
                  onClick={() => setTrackPage((page) => page - 1)}
                >
                  Previous tracks
                </button>
                <span>
                  {trackPage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={trackPage + 1 === totalPages}
                  onClick={() => setTrackPage((page) => page + 1)}
                >
                  Next tracks
                </button>
              </div>
            )}
          </>
        ) : stage && log ? (
          <>
            <div className="details-stage-nav">
              {log.stages.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={index === stageIndex ? "active" : ""}
                  onClick={() => setStageIndex(index)}
                  aria-label={item.title}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="details-stage-header">
              <h3>{stage.title}</h3>
              <span className={`log-status status-${stage.status}`}>
                {stage.status}
              </span>
            </div>
            <p className="details-stage-description">{stage.description}</p>
            <div className="details-stage-changes">
              {stage.changes.map((change, index) => (
                <div className="details-change" key={index}>
                  <strong>{change.after?.name ?? change.before?.name}</strong>
                  <span>
                    {change.kind} · {change.before?.notes.length ?? 0} →{" "}
                    {change.after?.notes.length ?? 0} notes ·{" "}
                    {change.after?.pitchBends?.length ?? 0} output bends
                  </span>
                </div>
              ))}
              {!stage.changes.length && (
                <p>No track events were changed at this stage.</p>
              )}
            </div>
          </>
        ) : null}
      </div>
      <footer className="details-downloads">
        <button
          type="button"
          className="hardware-button"
          disabled={!log}
          onClick={() => downloadLog("txt")}
        >
          DOWNLOAD FULL LOG
        </button>
        <button
          type="button"
          className="hardware-button"
          disabled={!log}
          onClick={() => downloadLog("json")}
        >
          JSON
        </button>
      </footer>
    </div>
  );
}
