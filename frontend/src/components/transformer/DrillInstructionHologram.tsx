import "./DrillInstructionHologram.css";

interface DrillInstructionHologramProps {
  visible: boolean;
}

export default function DrillInstructionHologram({
  visible,
}: DrillInstructionHologramProps) {
  return (
    <div
      className={
        visible
          ? "drill-instruction-hologram visible"
          : "drill-instruction-hologram"
      }
      aria-hidden={!visible}
    >
      <div className="instruction-beam" aria-hidden="true" />

      <div className="instruction-projection">
        <strong data-text="LOAD MIDI">LOAD MIDI</strong>
        <div className="instruction-scanline" aria-hidden="true" />

        <p>Drag a file from the library on the left.</p>
      </div>
    </div>
  );
}
