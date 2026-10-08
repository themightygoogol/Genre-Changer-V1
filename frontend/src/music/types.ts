export type NoteInfo = {
  name: string;
  midi: number;
  time: number;
  duration: number;
  velocity: number;
};

export interface PitchBendInfo {
  time: number;
  value: number;
}

export type MidiTrackInfo = {
  trackIndex: number;
  name: string;
  instrumentName: string;
  instrumentFamily: string;
  instrumentNumber: number;
  channel: number;
  noteCount: number;
  notes: NoteInfo[];

  pitchBends?: PitchBendInfo[];
};

export type MidiProjectInfo = {
  fileName: string;
  bpm?: number;
  duration?: number;
  tracks: MidiTrackInfo[];
};
