import { useRef, useEffect, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./HomeLink.css";

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

export default function HomeLink() {
  const location = useLocation();
  const navigate = useNavigate();
  const returning = useRef(false);
  const onGenrePage = location.pathname.startsWith("/transform/");

  useEffect(
    () => () => {
      document.documentElement.classList.remove("vinyl-return-transition");
    },
    [],
  );

  function returnHome(event: MouseEvent<HTMLAnchorElement>) {
    if (
      !onGenrePage ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    if (returning.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const doc = document as TransitionDocument;
    if (reduced) {
      navigate("/");
      return;
    }
    const genre = location.pathname.split("/").pop();
    if (!doc.startViewTransition) {
      navigate("/", { state: { vinylReturn: true, genre } });
      return;
    }
    returning.current = true;
    document.documentElement.classList.add("vinyl-return-transition");
    try {
      const transition = doc.startViewTransition(() => {
        flushSync(() =>
          navigate("/", {
            state: { vinylReturn: true, nativeVinylReturn: true, genre },
          }),
        );
      });
      void transition.finished
        .catch(() => {})
        .finally(() => {
          returning.current = false;
          document.documentElement.classList.remove("vinyl-return-transition");
        });
    } catch {
      returning.current = false;
      document.documentElement.classList.remove("vinyl-return-transition");
      navigate("/", { state: { vinylReturn: true, genre } });
    }
  }

  return (
    <>
      <Link to="/" className="site-brand" onClick={returnHome}>
        MIDI SHIFT
      </Link>
    </>
  );
}
