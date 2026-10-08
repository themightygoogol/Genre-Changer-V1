import "./DrillPage.css";
import { useEffect, useState } from "react";
import { Midi } from "@tonejs/midi";

import MidiMachine, { type MachineState } from "../components/MidiMachine";
import PanelDeck, {
  type PanelDeckItem,
} from "../components/transformer/PanelDeck";
import type { MidiSample } from "../components/transformer/SamplePicker";
import MidiLibrary, {
  type UserMidiFile,
} from "../components/transformer/MidiLibrary";
import PlaybackPanel from "../components/transformer/PlaybackPanel";
import DetailsPanel from "../components/transformer/DetailsPanel";
import {
  MIDI_LIBRARY_DRAG_TYPE,
  type MidiLibraryDragPayload,
} from "../components/transformer/midiLibraryDrag";
import { transformToDrillWithLog } from "../music/transformDrill";
import type { MidiTrackInfo } from "../music/types";
import GenreTransformer from "../components/transformer/GenreTransformer";
import { genreThemes } from "../components/transformer/themes/genreThemes";
import { useDocking } from "../components/transformer/useDocking";
import FitPanel from "../components/transformer/FitPanel";
import type { TransformationLog } from "../music/transformationLog";
import DrillInstructionHologram from "../components/transformer/DrillInstructionHologram";
import {
  deleteMidi,
  getStoredMidis,
  saveMidi,
} from "../components/transformer/midiStorage";

const SAMPLES: MidiSample[] = [
  {
    name: "Drill Contrast",
    description:
      "16 bars at 140 BPM: bright major piano, open chords, plain bass and straight drums reveal the minor shift, bass slides and generated hats.",
    file: "/samples/sample_drill_contrast_c_major.mid",
  },
  {
    name: "Bright Piano",
    description:
      "Major-key arrangement that makes the tonal change easy to hear.",
    file: "/samples/sample_bright_c_major.mid",
  },
  {
    name: "Spacious Melody",
    description:
      "Simple melody and bass with room for the generated drill rhythm.",
    file: "/samples/sample_spacious_g_major.mid",
  },
  {
    name: "Minimal Arrangement",
    description:
      "Sparse arrangement that makes the bass transformation easy to hear.",
    file: "/samples/sample_minimal_d_major.mid",
  },
];

export default function DrillPage() {
  const [originalTracks, setOriginalTracks] = useState<MidiTrackInfo[]>([]);
  const [transformedTracks, setTransformedTracks] = useState<MidiTrackInfo[]>(
    [],
  );

  const [transformationLog, setTransformationLog] =
    useState<TransformationLog | null>(null);
  const [selectedUserMidiId, setSelectedUserMidiId] = useState<string | null>(
    null,
  );

  const [bpm, setBpm] = useState(120);
  const [fileName, setFileName] = useState<string | null>(null);
  const [machineState, setMachineState] = useState<MachineState>("idle");
  const [activePanel, setActivePanel] = useState(0);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [isLibraryItemDragging, setIsLibraryItemDragging] = useState(false);
  const [userMidis, setUserMidis] = useState<UserMidiFile[]>([]);

  const isProcessing =
    machineState === "feeding" ||
    machineState === "analyzing" ||
    machineState === "transforming";

  const dockPhase = useDocking(selectedUserMidiId ?? fileName);
  const isDockTransition =
    dockPhase === "docking" ||
    dockPhase === "unplugging" ||
    dockPhase === "retreating";
  const isBusy = isProcessing || isDockTransition;
  const showHologram = dockPhase === "idle" || dockPhase === "retreating";

  const transformationComplete = machineState === "complete";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    async function restoreMidiLibrary() {
      try {
        const storedMidis = await getStoredMidis();

        setUserMidis(storedMidis);
      } catch (error) {
        console.error("Could not restore MIDI library:", error);
      }
    }

    void restoreMidiLibrary();
  }, []);

  function loadMidi(
    arrayBuffer: ArrayBuffer,
    name: string,
    userMidiId: string | null = null,
  ) {
    const midi = new Midi(arrayBuffer);
    const detectedBpm = midi.header.tempos[0]?.bpm ?? 120;

    const trackData: MidiTrackInfo[] = midi.tracks
      .map((track, trackIndex) => ({
        trackIndex,
        name: track.name || `Track ${trackIndex + 1}`,
        instrumentName: track.instrument.name,
        instrumentFamily: track.instrument.family,
        instrumentNumber: track.instrument.number,
        channel: track.channel,
        noteCount: track.notes.length,
        notes: track.notes.map((note) => ({
          name: note.name,
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
        })),
        pitchBends: track.pitchBends.map((bend) => ({
          time: bend.time,
          value: bend.value,
        })),
      }))
      .filter((track) => track.noteCount > 0);

    setSelectedUserMidiId(userMidiId);
    setTransformationLog(null);
    setBpm(detectedBpm);
    setOriginalTracks(trackData);
    setTransformedTracks([]);
    setFileName(name);
    setSampleError(null);
    setMachineState("loaded");
    setActivePanel(0);
  }

  async function rememberUserMidi(file: File) {
    const midi: UserMidiFile = {
      id: crypto.randomUUID(),
      file,
    };

    setUserMidis((current) => [...current, midi]);

    try {
      await saveMidi(midi);
    } catch (error) {
      console.error("Could not save MIDI:", error);
    }
  }

  async function handleDeleteUserMidi(id: string) {
    if (isBusy) return;
    if (selectedUserMidiId === id) clearSelectedMidi();
    setUserMidis((current) => current.filter((midi) => midi.id !== id));

    try {
      await deleteMidi(id);
    } catch (error) {
      console.error("Could not delete MIDI:", error);
    }
  }

  function handleLibraryImport(files: File[]) {
    for (const file of files) {
      void rememberUserMidi(file);
    }
  }

  async function loadFile(file: File, id: string) {
    const arrayBuffer = await file.arrayBuffer();

    loadMidi(arrayBuffer, file.name, id);
  }

  function clearSelectedMidi() {
    setSelectedUserMidiId(null);
    setTransformationLog(null);
    setOriginalTracks([]);
    setTransformedTracks([]);

    setBpm(120);
    setFileName(null);

    setMachineState("idle");
    setActivePanel(0);

    setSampleError(null);
    setLoadingSample(null);

    setIsLibraryItemDragging(false);
  }

  function sleep(ms: number) {
    return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
  }

  async function handleSample(file: string, name: string) {
    if (isBusy) return;
    try {
      setSampleError(null);
      setLoadingSample(file);

      const response = await fetch(file);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      loadMidi(arrayBuffer, name);
    } catch (error) {
      console.error("Could not load sample MIDI:", error);
      setSampleError(
        "Sample MIDI could not be loaded. Check public/samples and the file name.",
      );
    } finally {
      setLoadingSample(null);
    }
  }

  async function handleTransformToDrill() {
    if (originalTracks.length === 0 || isBusy) return;

    setActivePanel(0);
    setMachineState("feeding");
    await sleep(450);

    setMachineState("analyzing");
    await sleep(600);

    setMachineState("transforming");

    try {
      const result = transformToDrillWithLog(
        originalTracks,
        bpm,
        fileName ?? "Untitled MIDI",
      );
      setTransformedTracks(result.tracks);
      setTransformationLog(result.log);
    } catch (error) {
      console.error("Transformation failed:", error);
      setMachineState("loaded");
      setSampleError(
        "Could not transform this MIDI. Try loading another file.",
      );
      return;
    }

    await sleep(850);
    setMachineState("complete");
  }

  function handleDownload() {
    if (!transformationComplete || transformedTracks.length === 0) return;

    const outputMidi = new Midi();
    outputMidi.header.setTempo(bpm);

    for (const track of transformedTracks) {
      const midiTrack = outputMidi.addTrack();

      midiTrack.name = track.name;
      midiTrack.channel = track.channel;
      midiTrack.instrument.number = track.instrumentNumber;

      for (const note of track.notes) {
        midiTrack.addNote({
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
        });
      }

      track.pitchBends?.forEach((bend) => {
        midiTrack.addPitchBend({
          time: bend.time,
          value: bend.value,
        });
      });
    }

    const midiArray = outputMidi.toArray();
    const midiBytes = new Uint8Array(midiArray.length);
    midiBytes.set(midiArray);

    const blob = new Blob([midiBytes], {
      type: "audio/midi",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "drill-transformed.mid";
    link.click();

    URL.revokeObjectURL(url);
  }

  const panels: PanelDeckItem[] = [
    {
      id: "transform",
      description: "Transformation engine",
      label: "TRANSFORM",
      content: (
        <div
          className={
            isLibraryItemDragging
              ? "transform-machine-scene sample-drag-active"
              : "transform-machine-scene"
          }
          onDragOver={(event) => {
            if (isBusy) return;
            const types = Array.from(event.dataTransfer.types);

            if (!types.includes(MIDI_LIBRARY_DRAG_TYPE)) {
              return;
            }

            event.preventDefault();

            setIsLibraryItemDragging(true);
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node)) {
              return;
            }

            setIsLibraryItemDragging(false);
          }}
          onDrop={(event) => {
            if (isBusy) {
              event.preventDefault();
              return;
            }
            const raw = event.dataTransfer.getData(MIDI_LIBRARY_DRAG_TYPE);

            if (!raw) {
              return;
            }

            event.preventDefault();

            setIsLibraryItemDragging(false);

            const item = JSON.parse(raw) as MidiLibraryDragPayload;

            if (item.kind === "sample") {
              void handleSample(item.file, item.name);

              return;
            }

            const userMidi = userMidis.find(
              (candidate) => candidate.id === item.id,
            );

            if (userMidi) {
              void loadFile(userMidi.file, userMidi.id);
            }
          }}
        >
          <FitPanel expanded={showHologram}>
            <DrillInstructionHologram visible={showHologram} />

            <MidiMachine
              title={`${genreThemes.drill.label} Transformer`}
              fileName={fileName}
              state={machineState}
              controlsDisabled={isBusy}
              onTransform={handleTransformToDrill}
              onDownload={handleDownload}
              onClearFile={() => {
                if (!isBusy) clearSelectedMidi();
              }}
            />
          </FitPanel>

          <div className="sample-drop-feedback" aria-hidden="true">
            DROP MIDI HERE
          </div>
        </div>
      ),
    },
    {
      id: "listen",
      description: "Arrangement playback",
      label: "LISTEN",
      content: (
        <PlaybackPanel
          key={selectedUserMidiId ?? fileName ?? "empty"}
          originalTracks={originalTracks}
          transformedTracks={transformedTracks}
          transformationComplete={transformationComplete}
        />
      ),
    },
    {
      id: "details",
      description: "MIDI analysis",
      label: "DETAILS",
      content: (
        <DetailsPanel
          key={`${fileName ?? "none"}-${transformationComplete}`}
          fileName={fileName}
          bpm={bpm}
          originalTracks={originalTracks}
          transformedTracks={transformedTracks}
          transformationComplete={transformationComplete}
          log={transformationLog}
        />
      ),
    },
  ];

  return (
    <GenreTransformer
      theme={genreThemes.drill}
      state={machineState}
      dockPhase={dockPhase}
    >
      <MidiLibrary
        samples={SAMPLES}
        userMidis={userMidis}
        currentFileName={fileName}
        loadingSample={loadingSample}
        error={sampleError}
        onImportFiles={handleLibraryImport}
        onDeleteUserMidi={handleDeleteUserMidi}
        busy={isBusy}
      />
      <section className="workspace-stage">
        <PanelDeck
          panels={panels}
          activeIndex={activePanel}
          onChange={setActivePanel}
          canNavigate={
            Boolean(fileName) && !isBusy && dockPhase === "connected"
          }
          hasFile={Boolean(fileName)}
          dockPhase={dockPhase}
        />
      </section>
    </GenreTransformer>
  );
}
