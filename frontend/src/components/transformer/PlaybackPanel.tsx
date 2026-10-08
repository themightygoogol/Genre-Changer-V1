import HardwareScrews from "../HardwareScrews";
import "./PlaybackPanel.css";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MidiTrackInfo } from "../../music/types";
import DawTrackView from "./DawTrackView";

interface PlaybackPanelProps {
  originalTracks: MidiTrackInfo[];
  transformedTracks: MidiTrackInfo[];
  transformationComplete: boolean;
}

type PlaybackVersion = "original" | "drill";

function getDuration(tracks: MidiTrackInfo[]) {
  return Math.max(
    0,
    ...tracks.flatMap((track) =>
      track.notes.map((note) => note.time + note.duration),
    ),
  );
}

function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function oscillatorTypeForTrack(track: MidiTrackInfo): OscillatorType {
  const family = track.instrumentFamily.toLowerCase();

  if (family.includes("bass")) return "sine";
  if (family.includes("guitar")) return "sawtooth";
  if (family.includes("strings")) return "sawtooth";
  if (family.includes("piano") || family.includes("keyboard"))
    return "triangle";

  return "triangle";
}

function isDrumTrack(track: MidiTrackInfo) {
  return (
    track.channel === 9 || track.instrumentFamily.toLowerCase() === "drums"
  );
}

export default function PlaybackPanel({
  originalTracks,
  transformedTracks,
  transformationComplete,
}: PlaybackPanelProps) {
  const [version, setVersion] = useState<PlaybackVersion>("original");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.42);

  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioScheduledSourceNode[]>([]);
  const progressTimerRef = useRef<number | null>(null);
  const playbackStartRef = useRef(0);

  const tracks =
    version === "drill" && transformationComplete
      ? transformedTracks
      : originalTracks;

  const duration = useMemo(() => getDuration(tracks), [tracks]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current !== null) {
        window.clearInterval(progressTimerRef.current);
      }

      for (const node of nodesRef.current) {
        try {
          node.stop();
        } catch {
          console.log('Failed to stop node', node);
        }
      }

      void contextRef.current?.close();
    };
  }, []);

  function clearScheduledAudio() {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    for (const node of nodesRef.current) {
      try {
        node.stop();
      } catch {
        console.log('Failed to stop node', node);
      }
    }

    nodesRef.current = [];
    masterGainRef.current = null;

    if (contextRef.current) {
      void contextRef.current.close();
      contextRef.current = null;
    }
  }

  function stopPlayback() {
    clearScheduledAudio();
    setIsPlaying(false);
    setProgress(0);
  }

  function schedulePitchedNote(
    context: AudioContext,
    destination: AudioNode,
    track: MidiTrackInfo,
    note: MidiTrackInfo["notes"][number],
    startAt: number,
  ) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = oscillatorTypeForTrack(track);
    oscillator.frequency.setValueAtTime(midiToFrequency(note.midi), startAt);

    const level = Math.max(0.012, note.velocity * 0.055);
    const endAt = startAt + Math.max(note.duration, 0.04);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(level, startAt + 0.008);
    gain.gain.setValueAtTime(level, Math.max(startAt + 0.009, endAt - 0.035));
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain);
    gain.connect(destination);

    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);

    nodesRef.current.push(oscillator);
  }

  function scheduleNoiseHit(
    context: AudioContext,
    destination: AudioNode,
    midi: number,
    velocity: number,
    startAt: number,
  ) {
    if (midi === 35 || midi === 36) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(115, startAt);
      oscillator.frequency.exponentialRampToValueAtTime(48, startAt + 0.12);

      gain.gain.setValueAtTime(Math.max(0.025, velocity * 0.12), startAt);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18);

      oscillator.connect(gain);
      gain.connect(destination);

      oscillator.start(startAt);
      oscillator.stop(startAt + 0.2);
      nodesRef.current.push(oscillator);
      return;
    }

    const length = Math.floor(context.sampleRate * 0.16);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = buffer;

    const isHat = midi === 42 || midi === 44 || midi === 46;
    filter.type = isHat ? "highpass" : "bandpass";
    filter.frequency.value = isHat ? 6500 : 1800;
    filter.Q.value = isHat ? 0.8 : 1.2;

    const hitDuration = isHat ? 0.055 : 0.13;
    gain.gain.setValueAtTime(Math.max(0.01, velocity * 0.08), startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + hitDuration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    source.start(startAt);
    source.stop(startAt + hitDuration + 0.02);
    nodesRef.current.push(source);
  }

  function play() {
    if (tracks.length === 0 || duration <= 0) return;

    clearScheduledAudio();

    const AudioContextClass = window.AudioContext;
    const context = new AudioContextClass();
    const master = context.createGain();

    contextRef.current = context;
    masterGainRef.current = master;

    master.gain.value = volume;
    master.connect(context.destination);

    const startOffset = 0.08;
    const timelineStart = context.currentTime + startOffset;

    for (const track of tracks) {
      for (const note of track.notes) {
        const startAt = timelineStart + note.time;

        if (isDrumTrack(track)) {
          scheduleNoiseHit(context, master, note.midi, note.velocity, startAt);
        } else {
          schedulePitchedNote(context, master, track, note, startAt);
        }
      }
    }

    playbackStartRef.current = performance.now() + startOffset * 1000;
    setProgress(0);
    setIsPlaying(true);

    progressTimerRef.current = window.setInterval(() => {
      const elapsed = Math.max(
        0,
        (performance.now() - playbackStartRef.current) / 1000,
      );

      const nextProgress = Math.min(1, elapsed / duration);
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        clearScheduledAudio();
        setIsPlaying(false);
        setProgress(0);
      }
    }, 50);
  }

  function switchVersion(nextVersion: PlaybackVersion) {
    stopPlayback();
    setVersion(nextVersion);
  }

  function handleVolumeChange(nextVolume: number) {
    setVolume(nextVolume);

    if (masterGainRef.current && contextRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        nextVolume,
        contextRef.current.currentTime,
      );
    }
  }

  return (
    <div className="instrument-panel playback-panel">
      <HardwareScrews />
      <header className="instrument-panel-header">
        <div>
          <span className="panel-kicker">BROWSER SYNTH PREVIEW</span>
          <h2>Listen</h2>
        </div>

        <div className="segment-control">
          <button
            type="button"
            className={version === "original" ? "active" : ""}
            onClick={() => switchVersion("original")}
          >
            Original
          </button>

          <button
            type="button"
            className={version === "drill" ? "active" : ""}
            disabled={!transformationComplete}
            onClick={() => switchVersion("drill")}
          >
            Drill
          </button>
        </div>
      </header>
      <div className="playback-arrangement">
        <DawTrackView tracks={tracks} progress={progress} showPlayhead />
      </div>

      <div className="playback-transport-row">
        <button
          type="button"
          className="hardware-button transport-button"
          onClick={isPlaying ? stopPlayback : play}
          disabled={tracks.length === 0}
        >
          <i />
          {isPlaying ? "STOP" : "PLAY"}
        </button>

        <div className="playback-position" aria-label="Playback position">
          <span>{(duration * progress).toFixed(1)}s</span>
          <div className="playback-progress">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          <span>{duration.toFixed(1)}s</span>
        </div>

        <label className="playback-volume">
          <span>VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => handleVolumeChange(Number(event.target.value))}
          />
        </label>
      </div>

      <p className="panel-footnote">
        Preview uses a lightweight browser synth. Downloaded MIDI keeps the full
        MIDI note and pitch-bend data for your DAW.
      </p>
    </div>
  );
}
