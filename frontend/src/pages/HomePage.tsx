import "../components/home/HomeDisplayPolish.css";
import "./HomeTable.css";
import UnifiedDeckHousing from "../components/home/UnifiedDeckHousing";
import DeckInfoScreen from "../components/home/DeckInfoScreen";
import {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  type CSSProperties,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";

import VinylGenreSelector from "../components/VinylGenreSelector";

import "./HomePage.css";
import "../components/home/StudioHome.css";

interface LaunchInfo {
  path: string;
  x: number;
  y: number;
}

export default function HomePage() {
  const [selectedPaperGenre, setSelectedPaperGenre] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();
  const location = useLocation();
  const returnState = location.state as {
    vinylReturn?: boolean;
    nativeVinylReturn?: boolean;
    genre?: string;
  } | null;
  const isReturning = Boolean(returnState?.vinylReturn);
  const nativeReturn = Boolean(returnState?.nativeVinylReturn);
  const launchTimer = useRef<number | null>(null);

  const homeRef = useRef<HTMLElement>(null);

  const [isLeaving, setIsLeaving] = useState(false);

  const [transitionOrigin, setTransitionOrigin] = useState({
    x: "50%",
    y: "50%",
  });

  useEffect(
    () => () => {
      if (launchTimer.current !== null)
        window.clearTimeout(launchTimer.current);
    },
    [],
  );

  useLayoutEffect(() => {
    if (!isReturning) return;
    const home = homeRef.current;
    const disc = home?.querySelector<HTMLElement>(".vinyl-disc");
    if (!home || !disc) return;
    const zoom = home.querySelector<HTMLElement>(".home-zoom-content");
    const previousAnimation = zoom?.style.animation ?? "";

    if (zoom && !nativeReturn) zoom.style.animation = "none";

    let rect = disc.getBoundingClientRect();
    if (
      rect.bottom < 0 ||
      rect.top > window.innerHeight ||
      rect.top < 0 ||
      rect.bottom > window.innerHeight
    ) {
      window.scrollTo({
        top: Math.max(
          0,
          window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2,
        ),
        behavior: "auto",
      });
      rect = disc.getBoundingClientRect();
    }
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const homeRect = home.getBoundingClientRect();
    home.style.setProperty("--zoom-origin-x", `${x - homeRect.left}px`);
    home.style.setProperty("--zoom-origin-y", `${y - homeRect.top}px`);
    document.documentElement.style.setProperty("--vinyl-return-x", `${x}px`);
    document.documentElement.style.setProperty("--vinyl-return-y", `${y}px`);
    if (zoom && !nativeReturn) zoom.style.animation = previousAnimation;
  }, [isReturning, nativeReturn, location.key]);

  function handleGenreLaunch({ path, x, y }: LaunchInfo) {
    if (isLeaving) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigate(path);
      return;
    }
    const home = homeRef.current;

    if (home) {
      const rect = home.getBoundingClientRect();

      setTransitionOrigin({
        x: `${x - rect.left}px`,
        y: `${y - rect.top}px`,
      });
    }

    setIsLeaving(true);

    launchTimer.current = window.setTimeout(() => {
      navigate(path);
    }, 900);
  }

  const pageStyle = {
    "--zoom-origin-x": transitionOrigin.x,

    "--zoom-origin-y": transitionOrigin.y,
  } as CSSProperties;

  return (
    <main
      ref={homeRef}
      className={`home-page ${isLeaving ? "home-page-leaving" : ""} ${isReturning && !nativeReturn ? "home-page-returning" : ""}`}
      style={pageStyle}
    >
      <div className="home-zoom-content">
        <section className="landing-hero">
          <UnifiedDeckHousing>
            <DeckInfoScreen selectedGenre={selectedPaperGenre} />

            <VinylGenreSelector
              key={location.key}
              onGenreChange={setSelectedPaperGenre}
              onLaunch={handleGenreLaunch}
            />
          </UnifiedDeckHousing>
        </section>
      </div>

      <div className="home-transition-darkness" aria-hidden="true" />
    </main>
  );
}
