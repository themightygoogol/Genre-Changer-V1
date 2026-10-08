import type { MidiTrackInfo } from "../types";

const palettes = [
  { label: "Piano", color: "#68cfff" },
  { label: "Chromatic percussion", color: "#dfbc78" },
  { label: "Organ", color: "#97baff" },
  { label: "Guitar", color: "#80dc9a" },
  { label: "Bass / 808", color: "#f6ad71" },
  { label: "Strings", color: "#c59cf4" },
  { label: "Ensemble", color: "#e3a3da" },
  { label: "Brass", color: "#e5d078" },
  { label: "Reed", color: "#a5cf7d" },
  { label: "Pipe", color: "#79d8c2" },
  { label: "Synth lead", color: "#fa90b2" },
  { label: "Synth pad", color: "#999fee" },
  { label: "Synth effects", color: "#d297ea" },
  { label: "Ethnic", color: "#cdab89" },
  { label: "Percussive", color: "#f2bb83" },
  { label: "Sound effects", color: "#a5b5c3" },
];

export function instrumentColor(track: MidiTrackInfo): {
  label: string;
  color: string;
} {
  if (track.channel === 9 || track.instrumentFamily === "drums")
    return { label: "Drums", color: "#f18f82" };
  if (track.instrumentFamily === "bass" || /808/i.test(track.instrumentName))
    return palettes[4];
  if (!Number.isFinite(track.instrumentNumber))
    return { label: "Other", color: "#a5b5c3" };
  return palettes[
    Math.max(0, Math.min(15, Math.floor(track.instrumentNumber / 8)))
  ];
}
