import type { MidiTrackInfo, NoteInfo } from "../types";

export function createDrillHiHatTrack(
  songDuration: number,
  bpm: number,
): MidiTrackInfo {
  const notes: NoteInfo[] = [];

  const beatDuration = 60 / bpm;
  const hatInterval = beatDuration / 2;

  let index = 0;

  for (let time = 0; time < songDuration; time += hatInterval) {
    const isBeat = index % 2 === 0;

    notes.push({
      name: "F#2",
      midi: 42,
      time,
      duration: 0.08,

      velocity: isBeat ? 0.85 : 0.6,
    });

    index++;
  }

  return {
    trackIndex: 999,
    name: "Generated Drill Hi-Hats",
    instrumentName: "standard kit",
    instrumentFamily: "drums",
    instrumentNumber: 0,
    channel: 9,
    noteCount: notes.length,
    notes,
    pitchBends: [],
  };
}
