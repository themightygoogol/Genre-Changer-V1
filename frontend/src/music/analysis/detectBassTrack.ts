import type { MidiTrackInfo } from "../types";

export function detectBassTrack(tracks: MidiTrackInfo[]): MidiTrackInfo | null {
  let bestTrack: MidiTrackInfo | null = null;
  let lowestAveragePitch: number = Infinity;

  for (const track of tracks) {
    let totalPitch = 0;

    if (
      track.channel === 9 ||
      track.instrumentFamily === "drums" ||
      track.notes.length === 0
    ) {
      continue;
    }

    for (const note of track.notes) {
      totalPitch += note.midi;
    }

    const averagePitch = totalPitch / track.notes.length;

    if (averagePitch < lowestAveragePitch) {
      lowestAveragePitch = averagePitch;
      bestTrack = track;
    }
  }

  return bestTrack;
}
