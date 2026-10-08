import type { MidiTrackInfo } from "./types";
import type { DetectedKey } from "./analysis/detectKeys";

export interface TrackChange {
  kind: "modified" | "removed" | "generated";
  sourceTrackIndex: number | null;
  before: MidiTrackInfo | null;
  after: MidiTrackInfo | null;
}
export interface TransformationStage {
  id: string;
  title: string;
  status: "applied" | "unchanged" | "skipped";
  description: string;
  changes: TrackChange[];
}
export interface TransformationLog {
  schemaVersion: 1;
  genre: "drill";
  generatedAt: string;
  fileName: string;
  bpm: number;
  detectedKey: DetectedKey;
  targetKey: string;
  sourceBassTrackIndex: number | null;
  stages: TransformationStage[];
  input: MidiTrackInfo[];
  output: MidiTrackInfo[];
}

export function snapshotTrack(track: MidiTrackInfo): MidiTrackInfo {
  return {
    ...track,
    notes: track.notes.map((note) => ({ ...note })),
    pitchBends: track.pitchBends?.map((bend) => ({ ...bend })),
  };
}

function trackText(track: MidiTrackInfo): string[] {
  return [
    `Track ${track.trackIndex}: ${track.name}`,
    `  Instrument: ${track.instrumentName}; family: ${track.instrumentFamily}; program: ${track.instrumentNumber}; channel: ${track.channel + 1}`,
    `  Notes: ${track.notes.length}; pitch-bend events: ${track.pitchBends?.length ?? 0}`,
    ...track.notes.map(
      (note, index) =>
        `  Note ${index + 1}: ${note.name} (MIDI ${note.midi}), start=${note.time}s, duration=${note.duration}s, velocity=${note.velocity}`,
    ),
    ...(track.pitchBends ?? []).map(
      (bend, index) =>
        `  Bend ${index + 1}: time=${bend.time}s, value=${bend.value}`,
    ),
  ];
}

export function formatTransformationLog(log: TransformationLog): string {
  const lines = [
    "DRILL TRANSFORMER — FULL TRANSFORMATION LOG",
    `File: ${log.fileName}`,
    `Generated: ${log.generatedAt}`,
    `Tempo: ${log.bpm} BPM`,
    `Detected key: ${log.detectedKey.name} (heuristic score ${log.detectedKey.score}; not a probability)`,
    `Target key: ${log.targetKey}`,
    `Bass source track: ${log.sourceBassTrackIndex ?? "none"}`,
    "",
    "ENGINE STAGES",
  ];
  for (const stage of log.stages) {
    lines.push("", `${stage.title} [${stage.status}]`, stage.description);
    for (const change of stage.changes) {
      lines.push(
        `Change: ${change.kind}; source track: ${change.sourceTrackIndex ?? "generated"}`,
      );
      if (change.before) lines.push("BEFORE", ...trackText(change.before));
      if (change.after) lines.push("AFTER", ...trackText(change.after));
    }
  }
  lines.push(
    "",
    "COMPLETE INPUT",
    ...log.input.flatMap(trackText),
    "",
    "COMPLETE OUTPUT",
    ...log.output.flatMap(trackText),
  );
  return lines.join("\n");
}
