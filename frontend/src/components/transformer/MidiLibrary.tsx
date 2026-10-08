import { useEffect, useRef, useState, type ChangeEvent } from "react";
import SamplePicker, { type MidiSample } from "./SamplePicker";
import { MIDI_LIBRARY_DRAG_TYPE } from "./midiLibraryDrag";
import "./MidiLibrary.css";

export interface UserMidiFile {
  id: string;
  file: File;
}

interface MidiLibraryProps {
  busy?: boolean;
  samples: MidiSample[];
  userMidis: UserMidiFile[];
  currentFileName: string | null;
  loadingSample: string | null;
  error: string | null;
  onImportFiles: (files: File[]) => void;
  onDeleteUserMidi: (id: string) => void;
}

export default function MidiLibrary({
  busy = false,
  samples,
  userMidis,
  currentFileName,
  loadingSample,
  error,
  onImportFiles,
  onDeleteUserMidi,
}: MidiLibraryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [samplesExpanded, setSamplesExpanded] = useState(false);
  const [externalDragActive, setExternalDragActive] = useState(false);

  function getMidiFiles(files: FileList | null): File[] {
    return Array.from(files ?? []).filter((file) => {
      const lowerName = file.name.toLowerCase();

      return lowerName.endsWith(".mid") || lowerName.endsWith(".midi");
    });
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const files = getMidiFiles(event.target.files);

    if (files.length > 0) {
      onImportFiles(files);
    }

    event.target.value = "";
  }

  useEffect(() => {
    function containsFiles(event: DragEvent) {
      return Array.from(event.dataTransfer?.types ?? []).includes("Files");
    }

    function handleWindowDragOver(event: DragEvent) {
      if (!containsFiles(event)) {
        return;
      }

      event.preventDefault();

      setExternalDragActive(true);
    }

    function handleWindowDragLeave(event: DragEvent) {
      if (event.relatedTarget === null) {
        setExternalDragActive(false);
      }
    }

    function handleWindowDrop(event: DragEvent) {
      if (!containsFiles(event)) {
        return;
      }

      event.preventDefault();

      setExternalDragActive(false);

      const files = getMidiFiles(event.dataTransfer?.files ?? null);

      if (files.length > 0) {
        onImportFiles(files);
      }
    }

    window.addEventListener("dragover", handleWindowDragOver);

    window.addEventListener("dragleave", handleWindowDragLeave);

    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);

      window.removeEventListener("dragleave", handleWindowDragLeave);

      window.removeEventListener("drop", handleWindowDrop);
    };
  }, [onImportFiles]);

  return (
    <aside
      className={
        externalDragActive
          ? "midi-library external-drag-active"
          : "midi-library"
      }
      aria-label="MIDI library"
    >
      <div className="midi-library-drop-feedback" aria-hidden="true">
        <strong>ADD TO LIBRARY</strong>
        <span>Release to import MIDI</span>
      </div>
      <header className="midi-library-header">
        <div>
          <h2>MIDI Library</h2>
        </div>

        <div className="midi-library-led" aria-hidden="true" />
      </header>
      <button
        type="button"
        className="midi-library-import"
        onClick={() => inputRef.current?.click()}
      >
        <span className="midi-library-import-plus" aria-hidden="true">
          +
        </span>

        <span>
          <strong>Import MIDI</strong>
          <small>Add files from your computer</small>
        </span>
      </button>
      <input
        ref={inputRef}
        className="midi-library-file-input"
        type="file"
        accept=".mid,.midi"
        multiple
        onChange={handleImport}
      />
      <div className="midi-library-scroll">
        <section className="midi-library-section">
          <div className="midi-library-section-heading">
            <span>YOUR MIDIS</span>
          </div>

          {userMidis.length === 0 ? (
            <div className="midi-library-empty">
              <span>No imported files yet.</span>
              <small>Import a MIDI above, or start with a sample.</small>
            </div>
          ) : (
            <div className="user-midi-grid" role="list">
              {userMidis.map(({ id, file }) => {
                const selected = currentFileName === file.name;

                return (
                  <div
                    key={id}
                    className={
                      selected
                        ? "user-midi-document selected"
                        : "user-midi-document"
                    }
                    draggable
                    title={file.name}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "copy";

                      event.dataTransfer.setData(
                        MIDI_LIBRARY_DRAG_TYPE,
                        JSON.stringify({
                          kind: "user",
                          id,
                        }),
                      );
                    }}
                  >
                    <button
                      type="button"
                      className="user-midi-delete"
                      disabled={busy}
                      aria-label={`Remove ${file.name} from library`}
                      title="Remove from library"
                      draggable={false}
                      onDragStart={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteUserMidi(id);
                      }}
                    >
                      ×
                    </button>

                    <div className="user-midi-sheet" aria-hidden="true">
                      <span>MIDI</span>
                      <i />
                    </div>

                    <strong>{file.name}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section
          className={
            samplesExpanded
              ? "midi-library-section midi-library-samples expanded"
              : "midi-library-section midi-library-samples"
          }
        >
          <button
            type="button"
            className="midi-library-section-toggle"
            onClick={() => setSamplesExpanded((current) => !current)}
            aria-expanded={samplesExpanded}
            aria-controls="midi-library-sample-content"
          >
            <span>SAMPLES</span>

            <span className="midi-library-section-chevron" aria-hidden="true">
              ↓
            </span>
          </button>

          <div
            id="midi-library-sample-content"
            className="midi-library-sample-collapse"
          >
            <div className="midi-library-sample-collapse-inner">
              <SamplePicker
                samples={samples}
                loadingSample={loadingSample}
                error={error}
              />
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
