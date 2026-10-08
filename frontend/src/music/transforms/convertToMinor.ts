import type { MidiTrackInfo, NoteInfo } from "../types";
import type { DetectedKey } from "../analysis/detectKeys";
import { midiToNoteName } from "../utils/midiUtils";

export function convertTrackToMinor(
  track: MidiTrackInfo,
  key: DetectedKey,
): MidiTrackInfo {
  if (key.mode === "minor") {
    return track;
  }

  const transformedNotes = track.notes.map((note) =>
    convertNoteToMinor(note, key.root),
  );

  return {
    ...track,
    notes: transformedNotes,
  };
}

function convertNoteToMinor(note: NoteInfo, root: number): NoteInfo {
  const interval = (note.midi - root + 12) % 12;
  let newMidi = note.midi;

  if (interval === 4 || interval === 9 || interval === 11) {
    newMidi -= 1;
  }

  return {
    ...note,
    midi: newMidi,
    name: midiToNoteName(newMidi),
  };
}
