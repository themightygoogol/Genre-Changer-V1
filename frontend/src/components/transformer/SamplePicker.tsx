import "./SamplePicker.css";
import { MIDI_LIBRARY_DRAG_TYPE } from "./midiLibraryDrag";

export interface MidiSample {
  name: string;
  description: string;
  file: string;
}

interface SamplePickerProps {
  samples: MidiSample[];
  loadingSample: string | null;
  error: string | null;
  selectedName?: string | null;
}

export default function SamplePicker({
  samples,
  loadingSample,
  error,
  selectedName = null,
}: SamplePickerProps) {
  const isBusy = loadingSample !== null;

  return (
    <div className="sample-picker">
      <div className="sample-library-heading">
        <span>SAMPLE LIBRARY</span>

        <p>
          Samples are pre-made MIDI files that you can use to test the
          transformer. You can also import your own MIDI files.
        </p>
      </div>

      <div className="sample-shelf" role="list" aria-label="Sample MIDI files">
        {samples.map((sample) => {
          const isLoading = loadingSample === sample.file;

          return (
            <div
              key={sample.file}
              className={[
                "sample-document",
                isLoading ? "loading" : "",
                selectedName === sample.name ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              draggable={!isBusy}
              title={sample.description}
              onDragStart={(event) => {
                if (isBusy) {
                  event.preventDefault();
                  return;
                }

                event.dataTransfer.effectAllowed = "copy";

                event.dataTransfer.setData(
                  MIDI_LIBRARY_DRAG_TYPE,
                  JSON.stringify({
                    kind: "sample",
                    file: sample.file,
                    name: sample.name,
                  }),
                );
              }}
            >
              <div className="sample-document-sheet" aria-hidden="true">
                <div className="sample-document-fold" />

                <span>{isLoading ? "..." : "MIDI"}</span>
              </div>

              <strong>{sample.name}</strong>
            </div>
          );
        })}
      </div>

      {error && <p className="sample-error">{error}</p>}
    </div>
  );
}
