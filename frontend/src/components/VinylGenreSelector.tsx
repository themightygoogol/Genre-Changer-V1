import HardwareScrews from "./HardwareScrews";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import HomeVinylPrompt from "./home/HomeVinylPrompt";
import "./VinylGenreSelector.css";

interface Genre {
  name: string;
  path: string;
  angle: number;

  color: string;
  rgb: string;

  preview: string;

  image: string;
}

interface VinylGenreSelectorProps {
  onGenreChange?: (genreId: string | null) => void;
  initialGenreId?: string;
  onLaunch: (info: { path: string; x: number; y: number }) => void;
}

const GENRES: Genre[] = [
  {
    name: "Drill",
    path: "/transform/drill",
    angle: 0,

    color: "#43d9ff",
    rgb: "67, 217, 255",

    preview: "/sample-loops/drill loop sample - EternalProductions.wav",
    image: "/sample-images/drill-sample-image.jpg",
  },
  {
    name: "Metal",
    path: "/transform/metal",
    angle: 90,

    color: "#62e6a5",
    rgb: "98, 230, 165",

    preview: "/sample-loops/heavy metal loop sample - pnnywze.wav",
    image: "/sample-images/metal-sample-image.jpg",
  },
  {
    name: "House",
    path: "/transform/house",
    angle: 180,

    color: "#ff5fa2",
    rgb: "255, 95, 162",

    preview: "/sample-loops/house loop sample - iosdaw.wav",
    image: "/sample-images/house-sample-image.jpg",
  },
  {
    name: "Lo-Fi",
    path: "/transform/lofi",
    angle: 270,

    color: "#f4d88a",
    rgb: "244, 216, 138",

    preview: "/sample-loops/lo-fi loop sample - prodessential.wav",
    image: "/sample-images/lofi-sample-image.jpg",
  },
];

export default function VinylGenreSelector({
  onGenreChange,
  onLaunch,
  initialGenreId,
}: VinylGenreSelectorProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const initialGenre =
    GENRES.find((genre) => genre.path === `/transform/${initialGenreId}`) ??
    null;
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(
    initialGenre,
  );

  useEffect(() => {
    onGenreChange?.(selectedGenre?.path.split("/").pop() ?? null);
  }, [selectedGenre, onGenreChange]);

  const [rotation, setRotation] = useState(
    initialGenre ? (360 - initialGenre.angle) % 360 : 0,
  );

  const [isSpinning, setIsSpinning] = useState(false);

  const [canEnter, setCanEnter] = useState(Boolean(initialGenre));

  const [volume, setVolume] = useState(0.45);

  const [isMuted, setIsMuted] = useState(false);

  const hologramGenre = selectedGenre && !isSpinning ? selectedGenre : null;

  const shiftButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      audio?.pause();
    };
  }, []);

  function handleVinylTransitionEnd(
    event: React.TransitionEvent<HTMLDivElement>,
  ) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.propertyName !== "transform") {
      return;
    }

    if (!isSpinning) {
      return;
    }

    setIsSpinning(false);
    setCanEnter(true);
  }

  function playGenrePreview(genre: Genre) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();

    audio.src = genre.preview;

    audio.currentTime = 0;

    audio.volume = isMuted ? 0 : volume;

    audio.loop = true;

    audio.play().catch((error) => {
      console.log("Could not play preview:", error);
    });
  }

  function deselectGenre() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setSelectedGenre(null);
    setCanEnter(false);
    setIsSpinning(false);
  }

  function selectGenre(genre: Genre) {
    if (isSpinning) {
      return;
    }

    if (selectedGenre?.name === genre.name) {
      deselectGenre();
      return;
    }

    setSelectedGenre(genre);

    setCanEnter(false);
    setIsSpinning(true);

    playGenrePreview(genre);

    const targetRotation = (360 - genre.angle) % 360;

    const currentRotation = ((rotation % 360) + 360) % 360;

    const difference = (targetRotation - currentRotation + 360) % 360;

    const nextRotation = rotation + 720 + difference;

    setRotation(nextRotation);
  }

  function handleVolumeChange(value: number) {
    setVolume(value);

    if (value > 0 && isMuted) {
      setIsMuted(false);
    }

    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : value;
    }
  }

  function toggleMute() {
    const newMuted = !isMuted;

    setIsMuted(newMuted);

    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  }

  function enterGenre() {
    if (!selectedGenre || !canEnter) {
      return;
    }

    const button = shiftButtonRef.current;

    if (!button) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const rect = button.getBoundingClientRect();

    onLaunch({
      path: selectedGenre.path,

      x: rect.left + rect.width / 2,

      y: rect.top + rect.height / 2,
    });
  }

  const activeColor = selectedGenre?.color ?? "#888892";

  const activeRgb = selectedGenre?.rgb ?? "136, 136, 146";

  const selectorStyle = {
    "--genre-color": activeColor,

    "--genre-rgb": activeRgb,

    "--counter-rotation": `${-rotation}deg`,

    "--volume-percent": `${volume * 100}%`,
  } as CSSProperties;

  function markerStyle(genre: Genre) {
    return {
      "--marker-color": genre.color,

      "--marker-rgb": genre.rgb,
    } as CSSProperties;
  }

  return (
    <section className="vinyl-selector" style={selectorStyle}>
      <HomeVinylPrompt
        colour={selectedGenre?.color ?? "#b8a0ff"}
        isSpinning={isSpinning}
      />
      <div className="genre-backgrounds" aria-hidden="true">
        {GENRES.map((genre) => (
          <div
            key={genre.name}
            className={
              selectedGenre?.name === genre.name
                ? "genre-background active"
                : "genre-background"
            }
            style={
              {
                backgroundImage: `url("${genre.image}")`,

                "--background-color": genre.color,

                "--background-rgb": genre.rgb,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <audio ref={audioRef} preload="auto" />

      <div className="turntable-deck">
        <HardwareScrews variant="deck" />
        <div className="platter-section">
          <div
            className={
              isSpinning
                ? "genre-hologram tuning"
                : hologramGenre
                  ? "genre-hologram locked"
                  : "genre-hologram"
            }
          >
            <span className="hologram-kicker">
              {hologramGenre?.name ? "SELECTED" : "SELECT A GENRE"}
            </span>

            <strong data-text={hologramGenre?.name ?? "SELECT A GENRE"}>
              {hologramGenre?.name ?? "SELECT A GENRE"}
            </strong>

            <div className="hologram-scanline" aria-hidden="true" />
          </div>

          <div
            className={hologramGenre ? "hologram-beam active" : "hologram-beam"}
            aria-hidden="true"
          />

          <div className="platter">
            <div className="strobe-ring" aria-hidden="true" />

            <div
              className={isSpinning ? "vinyl-disc spinning" : "vinyl-disc"}
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
              onTransitionEnd={handleVinylTransitionEnd}
            >
              <div className="vinyl-reflection" aria-hidden="true" />

              <div className="vinyl-quadrants" aria-hidden="true" />

              {GENRES.map((genre, index) => {
                const classNames = [
                  "genre-marker",

                  index === 0 ? "marker-drill" : "",

                  index === 1 ? "marker-metal" : "",

                  index === 2 ? "marker-house" : "",

                  index === 3 ? "marker-lofi" : "",

                  selectedGenre?.name === genre.name ? "selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    type="button"
                    key={genre.name}
                    className={classNames}
                    style={markerStyle(genre)}
                    disabled={isSpinning}
                    onClick={() => selectGenre(genre)}
                  >
                    <span>{genre.name}</span>
                  </button>
                );
              })}

              <div className="record-label" aria-hidden="true">
                <div className="record-label-lines" />
              </div>
            </div>

            <button
              ref={shiftButtonRef}
              type="button"
              className={canEnter ? "shift-button ready" : "shift-button"}
              disabled={!selectedGenre || !canEnter}
              onClick={enterGenre}
            >
              <span>MIDI</span>
              <strong>SHIFT</strong>
            </button>

            <div className="spindle" aria-hidden="true" />
          </div>
        </div>

        <svg className="tonearm" viewBox="0 0 180 460" aria-hidden="true">
          <defs>
            <linearGradient id="armMetal" x1="0" x2="1">
              <stop offset="0%" stopColor="#54545c" />

              <stop offset="45%" stopColor="#dadade" />

              <stop offset="70%" stopColor="#8b8b94" />

              <stop offset="100%" stopColor="#38383e" />
            </linearGradient>

            <radialGradient id="pivotMetal">
              <stop offset="0%" stopColor="#d9d9df" />

              <stop offset="35%" stopColor="#8c8c95" />

              <stop offset="100%" stopColor="#26262b" />
            </radialGradient>
          </defs>

          <rect
            className="tonearm-counterweight"
            x="104"
            y="7"
            width="56"
            height="28"
            rx="9"
          />

          <circle className="tonearm-base" cx="126" cy="71" r="47" />

          <circle cx="126" cy="71" r="25" fill="url(#pivotMetal)" />

          <circle cx="126" cy="71" r="8" fill="#18181c" />

          <path
            className="tonearm-arm"
            d="
              M 125 73
              C 121 130,
                108 187,
                84 242
              C 66 283,
                56 320,
                48 355
            "
          />

          <g
            className="headshell"
            transform="
              translate(30 342)
              rotate(-17)
            "
          >
            <rect x="0" y="0" width="40" height="54" rx="7" />

            <rect
              className="headshell-detail"
              x="7"
              y="8"
              width="26"
              height="4"
              rx="2"
            />

            <rect
              className="headshell-detail"
              x="7"
              y="17"
              width="20"
              height="4"
              rx="2"
            />

            <path
              className="stylus"
              d="
                M 20 54
                L 20 69
              "
            />

            <circle className="stylus-tip" cx="20" cy="71" r="3" />
          </g>
        </svg>

        <div className="preview-mixer">
          <div className="mixer-heading">VOLUME</div>

          <div className="mixer-level">
            <span>100</span>

            <span>75</span>

            <span>50</span>

            <span>25</span>

            <span>0</span>
          </div>

          <div className="volume-fader">
            <div className="fader-groove" />

            <input
              aria-label="Preview volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(event) =>
                handleVolumeChange(Number(event.target.value))
              }
            />
          </div>

          <button
            type="button"
            className={isMuted ? "mute-button muted" : "mute-button"}
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <svg className="volume-icon" viewBox="0 0 24 24">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />

              {!isMuted && (
                <>
                  <path
                    className="volume-wave"
                    d="M16 9.5c1.3 1.3 1.3 3.7 0 5"
                  />
                  <path className="volume-wave" d="M18.5 7c2.7 2.7 2.7 10 0" />
                </>
              )}

              {isMuted && (
                <>
                  <path className="mute-line" d="M16 9l5 6" />
                  <path className="mute-line" d="M21 9l-5 6" />
                </>
              )}
            </svg>
          </button>

          <div
            className={selectedGenre ? "preview-led active" : "preview-led"}
          />
        </div>
      </div>
    </section>
  );
}
