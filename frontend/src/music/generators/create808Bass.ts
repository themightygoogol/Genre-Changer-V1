import type { MidiTrackInfo, NoteInfo } from "../types";
import { midiToNoteName } from "../utils/midiUtils";

export function create808Bass(
  bassTrack: MidiTrackInfo,
  bpm: number,
): MidiTrackInfo {
  const sourceNotes = [...bassTrack.notes].sort((a, b) => a.time - b.time);

  if (sourceNotes.length === 0) {
    return {
      ...bassTrack,
      name: "Drill 808",
      instrumentName: "808 Bass",
      instrumentFamily: "bass",
      noteCount: 0,
      notes: [],
    };
  }

  const beatDuration = 60 / bpm;

  const songEnd = Math.max(
    ...sourceNotes.map((note) => note.time + note.duration),
  );

  const averagePitch =
    sourceNotes.reduce((sum, note) => sum + note.midi, 0) / sourceNotes.length;

  const targetAveragePitch = 30;

  const octaveShift = Math.round((targetAveragePitch - averagePitch) / 12) * 12;

  let seed = sourceNotes.reduce(
    (sum, note) => sum + note.midi * 31 + Math.round(note.time * 1000),
    1,
  );

  function random(): number {
    seed = (seed * 1664525 + 1013904223) >>> 0;

    return seed / 4294967296;
  }

  const holdLengths = [2, 3, 3, 4, 4];

  const notes: NoteInfo[] = [];

  let currentTime = sourceNotes[0].time;

  while (currentTime < songEnd) {
    const sourceNote = getNoteAtTime(sourceNotes, currentTime);

    const newMidi = sourceNote.midi + octaveShift;

    const holdBeats = holdLengths[Math.floor(random() * holdLengths.length)];

    const duration = Math.min(holdBeats * beatDuration, songEnd - currentTime);

    if (duration <= 0) {
      break;
    }

    const previous = notes[notes.length - 1];

    if (previous && previous.midi === newMidi) {
      previous.duration += duration;
    } else {
      notes.push({
        ...sourceNote,
        midi: newMidi,
        name: midiToNoteName(newMidi),
        time: currentTime,
        duration,
        velocity: Math.min(sourceNote.velocity + 0.1, 1),
      });
    }

    currentTime += duration;
  }

  return {
    ...bassTrack,
    name: "Drill 808",
    instrumentName: "808 Bass",
    instrumentFamily: "bass",
    noteCount: notes.length,
    notes,
    pitchBends: [],
  };
}

function getNoteAtTime(notes: NoteInfo[], time: number): NoteInfo {
  let closest = notes[0];

  for (const note of notes) {
    if (note.time > time) {
      break;
    }

    closest = note;
  }

  return closest;
}
