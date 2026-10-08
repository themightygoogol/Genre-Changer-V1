import type { MidiTrackInfo } from "../types";
import { NOTE_NAMES } from "../utils/midiUtils";

export interface DetectedKey {
  root: number;
  name: string;
  mode: "major" | "minor";
  score: number;
}

const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

export function detectKey(tracks: MidiTrackInfo[]): DetectedKey {
  const pitchCounts = new Array(12).fill(0);

  for (const track of tracks) {
    if (track.channel === 9 || track.instrumentFamily === "drums") {
      continue;
    }

    for (const note of track.notes) {
      const pitchClass = note.midi % 12;
      pitchCounts[pitchClass]++;
    }
  }

  let detectedKey: DetectedKey = {
    root: 0,
    name: "C major",
    mode: "major",
    score: -Infinity,
  };

  for (let root = 0; root < 12; root++) {
    for (const mode of ["major", "minor"] as const) {
      const scale = SCALE_INTERVALS[mode].map(
        (interval) => (root + interval) % 12,
      );

      const score = scoreScale(pitchCounts, scale, root);

      if (score > detectedKey.score) {
        detectedKey = {
          root,
          name: `${NOTE_NAMES[root]} ${mode}`,
          mode,
          score,
        };
      }
    }
  }

  return detectedKey;
}

function scoreScale(
  pitchCounts: number[],
  scale: number[],
  root: number,
): number {
  let score = 0;

  for (let pitch = 0; pitch < 12; pitch++) {
    if (scale.includes(pitch)) {
      score += pitchCounts[pitch];
    } else {
      score -= pitchCounts[pitch];
    }
  }

  score += pitchCounts[root] * 2;

  return score;
}
