import { useLayoutEffect, useRef, useState } from "react";
import { genreLoopSources } from "./genreLoopSources";
import "./HomeHologramCredit.css";
import "./HomeDisplayPolish.css";

export default function LoopPreviewCredit({
  genreId,
}: {
  genreId: string | null;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [filename, setFilename] = useState("");
  useLayoutEffect(() => {
    const home = hostRef.current?.closest(".home-page");
    if (!home) return;
    const update = () => {
      const audio = home.querySelector<HTMLAudioElement>(
        ".vinyl-selector audio",
      );
      const src = audio?.getAttribute("src") || "";
      let name = src.split("/").pop()?.split(/[?#]/)[0] || "";
      try {
        name = decodeURIComponent(name);
      } catch {
        console.warn("failed to decode filename:", name);
      }
      setFilename(genreId ? name : "");
    };
    const observer = new MutationObserver(update);
    observer.observe(home, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });
    home.addEventListener("loadstart", update, true);
    update();
    return () => {
      observer.disconnect();
      home.removeEventListener("loadstart", update, true);
    };
  }, [genreId]);
  const source = genreId ? genreLoopSources[genreId] : "";
  const safeSource =
    source && /^https?:\/\//i.test(source)
      ? source
      : "https://www.looperman.com/loops";
  const label = genreId ? filename || "LOOP PREVIEW" : "NO LOOP SELECTED";
  return (
    <div className="loop-preview-credit" ref={hostRef}>
      <small>PREVIEW LOOP</small>
      {safeSource && genreId ? (
        <a
          href={safeSource}
          target="_blank"
          rel="noreferrer"
          title={
            source
              ? `Open the source page for ${label}`
              : `${label} — browse the loop library`
          }
        >
          {label} ↗
        </a>
      ) : (
        <span>{label}</span>
      )}
    </div>
  );
}
