import { useEffect, useRef } from "react";

const graphs = new WeakMap<HTMLAudioElement, AnalyserNode>();
let context: AudioContext | undefined;
function connectPreview(audio: HTMLAudioElement): AnalyserNode | undefined {
  const existing = graphs.get(audio);
  if (existing) {
    void context?.resume().catch(() => {});
    return existing;
  }
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => {});
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    const source = context.createMediaElementSource(audio);

    source.connect(context.destination);
    source.connect(analyser);
    graphs.set(audio, analyser);
    return analyser;
  } catch {
    return undefined;
  }
}

export default function PreviewWaveform() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const home = root?.closest(".home-page");
    const pen = canvas?.getContext("2d");
    if (!root || !canvas || !home || !pen) return;
    const samples = new Uint8Array(2048);
    const findAudio = () =>
      home.querySelector<HTMLAudioElement>(".vinyl-selector audio");

    const unlock = () => {
      const audio = findAudio();
      if (audio) connectPreview(audio);
    };
    home.addEventListener("click", unlock, true);
    home.addEventListener("keydown", unlock, true);
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(root.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(root.clientHeight * ratio));
      pen.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();
    let frame = 0;
    let lastDraw = 0;
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (time - lastDraw < 33) return;
      lastDraw = time;
      const audio = findAudio();
      const analyser = audio ? graphs.get(audio) : undefined;
      const playing =
        !!audio &&
        !audio.paused &&
        !audio.ended &&
        !audio.muted &&
        audio.volume > 0 &&
        context?.state === "running" &&
        !!analyser;
      if (playing && analyser) analyser.getByteTimeDomainData(samples);
      const width = root.clientWidth,
        height = root.clientHeight;
      const colour =
        getComputedStyle(root).getPropertyValue("--terminal-accent").trim() ||
        "#b8a0ff";
      pen.clearRect(0, 0, width, height);
      pen.strokeStyle = colour;
      pen.globalAlpha = 0.12;
      pen.lineWidth = 1;
      pen.beginPath();
      for (let x = 0; x <= width; x += 20) {
        pen.moveTo(x, 0);
        pen.lineTo(x, height);
      }
      pen.moveTo(0, height * 0.6);
      pen.lineTo(width, height * 0.6);
      pen.stroke();
      pen.globalAlpha = playing ? 0.9 : 0.35;
      pen.lineWidth = 1.2;
      pen.beginPath();
      for (let x = 0; x <= width; x++) {
        const value = playing
          ? (samples[
              Math.min(
                samples.length - 1,
                Math.floor((x / Math.max(width, 1)) * samples.length),
              )
            ] -
              128) /
            128
          : 0;
        const y = height * 0.6 + value * height * 0.34;
        if (x === 0) pen.moveTo(x, y);
        else pen.lineTo(x, y);
      }
      pen.stroke();
      pen.globalAlpha = 1;
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      home.removeEventListener("click", unlock, true);
      home.removeEventListener("keydown", unlock, true);
    };
  }, []);
  return (
    <div
      ref={rootRef}
      className="preview-waveform"
      role="img"
      aria-label="Live waveform of the genre preview; flat when silent"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <span aria-hidden="true">AUDIO / WAVEFORM</span>
    </div>
  );
}
