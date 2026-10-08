import type { MidiTrackInfo, NoteInfo } from "../types";
import { midiToNoteName } from "../utils/midiUtils";

const PITCH_BEND_RANGE = 2;
const BEND_STEPS = 8;

export function add808Slides(track: MidiTrackInfo, bpm: number): MidiTrackInfo {
  const notes = track.notes.map((note) => ({
    ...note,
  }));

  const transitionNotes: NoteInfo[] = [];

  const pitchBends: {
    time: number;
    value: number;
  }[] = [];

  const beatDuration = 60 / bpm;

  let seed = notes.reduce(
    (sum, note) => sum + note.midi * 17 + Math.round(note.time * 1000),
    1,
  );

  function random(): number {
    seed = (seed * 1664525 + 1013904223) >>> 0;

    return seed / 4294967296;
  }

  let previousWasSlide = false;

  for (let i = 0; i < notes.length - 1; i++) {
    const current = notes[i];
    const next = notes[i + 1];

    if (previousWasSlide || current.duration < beatDuration * 2) {
      previousWasSlide = false;
      continue;
    }

    const transitionRoll = random();

    if (transitionRoll >= 0.7) {
      previousWasSlide = false;
      continue;
    }

    const slideDuration = beatDuration * (random() < 0.8 ? 0.25 : 0.5);

    let direction = Math.sign(next.midi - current.midi);

    if (direction === 0) {
      direction = random() < 0.5 ? -1 : 1;
    }

    const overshoot = random() < 0.8 ? 2 : 1;

    if (transitionRoll < 0.45) {
      const transitionStart = next.time - slideDuration;

      if (transitionStart <= current.time + beatDuration) {
        previousWasSlide = false;
        continue;
      }

      current.duration = transitionStart - current.time;

      const transitionMidi = next.midi + direction * overshoot;

      transitionNotes.push({
        ...next,

        midi: transitionMidi,
        name: midiToNoteName(transitionMidi),

        time: transitionStart,
        duration: slideDuration,

        velocity: Math.min(next.velocity + 0.05, 1),
      });

      const bendSemitones = next.midi - transitionMidi;

      const targetBend = semitonesToPitchBend(bendSemitones);

      pitchBends.push({
        time: transitionStart,
        value: 0,
      });

      const bendEnd = Math.max(transitionStart, next.time - 0.001);

      for (let step = 1; step <= BEND_STEPS; step++) {
        const progress = step / BEND_STEPS;

        pitchBends.push({
          time: transitionStart + (bendEnd - transitionStart) * progress,

          value: Math.round(targetBend * progress),
        });
      }

      pitchBends.push({
        time: next.time,
        value: 0,
      });
    } else {
      const originalNextTime = next.time;

      const slideStart = originalNextTime - slideDuration;

      if (slideStart <= current.time + beatDuration) {
        previousWasSlide = false;
        continue;
      }

      current.duration = slideStart - current.time;

      next.time = slideStart;
      next.duration += slideDuration;

      const slideSemitones = direction * overshoot;

      const startBend = semitonesToPitchBend(slideSemitones);

      pitchBends.push({
        time: Math.max(0, slideStart - 0.001),
        value: startBend,
      });

      for (let step = 1; step <= BEND_STEPS; step++) {
        const progress = step / BEND_STEPS;

        pitchBends.push({
          time: slideStart + slideDuration * progress,

          value: Math.round(startBend * (1 - progress)),
        });
      }
    }

    previousWasSlide = true;
  }

  const finalNotes = [...notes, ...transitionNotes].sort(
    (a, b) => a.time - b.time,
  );

  return {
    ...track,
    notes: finalNotes,
    noteCount: finalNotes.length,
    pitchBends,
  };
}

function semitonesToPitchBend(semitones: number): number {
  const normalized = semitones / PITCH_BEND_RANGE;

  return Math.max(-8192, Math.min(8191, Math.round(normalized * 8191)));
}
