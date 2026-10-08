import HardwareScrews from "./HardwareScrews";
import "./MidiMachine.css";

export type MachineState =
  "idle" | "loaded" | "feeding" | "analyzing" | "transforming" | "complete";

interface MidiMachineProps {
  title?: string;
  controlsDisabled?: boolean;
  fileName: string | null;
  state: MachineState;
  onTransform: () => void;
  onDownload: () => void;
  onClearFile: () => void;
}

export default function MidiMachine({
  title = "MIDI Transformer",
  controlsDisabled = false,
  fileName,
  state,
  onTransform,
  onDownload,
  onClearFile,
}: MidiMachineProps) {
  const hasFile = Boolean(fileName);

  const isProcessing =
    state === "feeding" || state === "analyzing" || state === "transforming";

  const transportActive =
    state === "loaded" ||
    state === "feeding" ||
    state === "analyzing" ||
    state === "transforming";

  function getStatusText() {
    switch (state) {
      case "idle":
        return "awaiting midi input";

      case "loaded":
        return "media detected";

      case "feeding":
        return "mounting midi sequence";

      case "analyzing":
        return "analyzing harmonic structure";

      case "transforming":
        return "constructing drill arrangement";

      case "complete":
        return "transformation complete";
    }
  }

  function getTerminalPrefix() {
    switch (state) {
      case "idle":
        return "SYS";
      case "loaded":
        return "MIDI";
      case "feeding":
        return "LOAD";
      case "analyzing":
        return "SCAN";
      case "transforming":
        return "PROC";
      case "complete":
        return "DONE";
    }
  }

  function getTransportText() {
    switch (state) {
      case "idle":
        return "EMPTY";
      case "loaded":
        return "LOADED";
      case "feeding":
        return "FEED";
      case "analyzing":
        return "SCAN";
      case "transforming":
        return "WRITE";
      case "complete":
        return "DONE";
    }
  }

  return (
    <section className="midi-machine-wrapper">
      <div className={`midi-machine state-${state}`}>
        <HardwareScrews />
        <header className="machine-header">
          <span className="machine-kicker">{title.toUpperCase()}</span>
        </header>

        <div className={`machine-bay ${hasFile ? "closed" : "open"}`}>
          <div className="machine-bay-frame">
            <div className="machine-door">
              <div className="machine-door-face">
                {!hasFile ? (
                  <>
                    <div className="machine-file-aperture" aria-hidden="true">
                      <div className="machine-file-aperture-inner">
                        <span className="machine-file-aperture-fold" />
                        <span className="machine-file-aperture-text">MIDI</span>
                      </div>
                    </div>

                    <div className="machine-insert-copy">
                      <span className="machine-door-label">INSERT MIDI</span>

                      <span className="machine-door-hint">
                        drag from library
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="machine-inserted-midi">
                      <div
                        className="machine-inserted-midi-file"
                        aria-hidden="true"
                      >
                        <span className="machine-inserted-midi-fold" />
                        <span>MIDI</span>
                      </div>
                    </div>

                    <div className="machine-loaded-copy">
                      <strong className="machine-loaded-name">
                        {fileName}
                      </strong>

                      <span className="machine-loaded-status">
                        <i />
                        mounted
                      </span>
                    </div>

                    {!isProcessing && (
                      <button
                        type="button"
                        className="machine-eject-button"
                        disabled={controlsDisabled}
                        onClick={onClearFile}
                        aria-label="Eject MIDI"
                        title="Eject MIDI"
                      >
                        EJECT
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`machine-transport ${
            transportActive ? "active" : ""
          } ${isProcessing ? "processing" : ""}`}
        >
          <div className="transport-window">
            <div className="transport-reel reel-left" aria-hidden="true">
              <span className="reel-hub" />
              <span className="reel-spoke spoke-1" />
              <span className="reel-spoke spoke-2" />
              <span className="reel-spoke spoke-3" />
            </div>

            <div className="transport-tape" aria-hidden="true">
              <span />
            </div>

            <div className="transport-head">
              <span className="transport-head-line" />
              <small>{getTransportText()}</small>
            </div>

            <div className="transport-reel reel-right" aria-hidden="true">
              <span className="reel-hub" />
              <span className="reel-spoke spoke-1" />
              <span className="reel-spoke spoke-2" />
              <span className="reel-spoke spoke-3" />
            </div>
          </div>

          <div className="transport-caption-row">
            <span
              className={`transport-status-light state-${state}`}
              aria-hidden="true"
            />

            <span className="transport-caption">MIDI DATA TRANSPORT</span>
          </div>
        </div>

        <div className="machine-terminal">
          <div className="terminal-topbar">
            <span>STATUS TERMINAL</span>

            <span className="terminal-state">{getTerminalPrefix()}</span>
          </div>

          <div className="terminal-screen">
            <div className="terminal-line terminal-muted">
              MIDI_SHIFT::TRANSFORM_ENGINE
            </div>

            <div className="terminal-line">
              <span className="terminal-prompt">&gt;</span>

              <span>{getStatusText()}</span>

              <span className="terminal-cursor" aria-hidden="true">
                _
              </span>
            </div>

            {hasFile && (
              <div className="terminal-line terminal-file">
                <span className="terminal-prompt">&gt;</span>

                <span>{fileName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="machine-controls">
          {state === "loaded" && (
            <button
              type="button"
              className="machine-transform-button"
              disabled={controlsDisabled}
              onClick={onTransform}
            >
              <span className="control-indicator" />
              TRANSFORM MIDI
            </button>
          )}

          {isProcessing && (
            <div className="machine-processing-label">MACHINE ACTIVE</div>
          )}

          {state === "complete" && (
            <button
              type="button"
              className="machine-download-button"
              disabled={controlsDisabled}
              onClick={onDownload}
            >
              DOWNLOAD MIDI
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
