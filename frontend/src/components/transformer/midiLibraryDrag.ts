export const MIDI_LIBRARY_DRAG_TYPE = "application/x-midi-shift-library-item";

export type MidiLibraryDragPayload =
  | {
      kind: "user";
      id: string;
    }
  | {
      kind: "sample";
      file: string;
      name: string;
    };
