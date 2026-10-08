import "./PanelDeck.css";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import SignalCables from "./SignalCables";
import type { DockPhase } from "./docking";

export interface PanelDeckItem {
  id: string;
  label: string;
  description?: string;
  content: ReactNode;
}

interface PanelDeckProps {
  panels: PanelDeckItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  canNavigate: boolean;
  hasFile: boolean;
  dockPhase: DockPhase;
}

export default function PanelDeck({
  panels,
  activeIndex,
  onChange,
  canNavigate,
  hasFile,
  dockPhase,
}: PanelDeckProps) {
  const selectedIndex = Math.max(0, Math.min(activeIndex, panels.length - 1));

  const deckRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousIndex = useRef(selectedIndex);
  const [dimensions, setDimensions] = useState({ depth: 260, halfWidth: 300 });
  const [rotating, setRotating] = useState(false);
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () =>
      setDimensions({
        depth: viewport.clientHeight / 2,
        halfWidth: viewport.clientWidth / 2,
      });
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (previousIndex.current === selectedIndex) return;

    previousIndex.current = selectedIndex;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setRotating(true);
    });

    const timer = window.setTimeout(() => {
      setRotating(false);
    }, 950);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [selectedIndex]);
  const navigationEnabled = canNavigate && !rotating;

  if (panels.length === 0) return null;

  return (
    <section
      ref={deckRef}
      style={
        {
          "--cube-depth": `${dimensions.depth}px`,
          "--cube-half-width": `${dimensions.halfWidth}px`,
          "--cube-angle": `${selectedIndex * 90}deg`,
        } as CSSProperties
      }
      className={`panel-deck dock-${dockPhase} ${rotating ? "cube-rotating" : ""} ${hasFile ? "panel-deck-ready" : "panel-deck-locked"} ${hasFile && !canNavigate ? "panel-deck-processing" : ""}`}
    >
      <div className="panel-content-zone">
        <div className="panel-viewport" ref={viewportRef}>
          <div className="panel-stack">
            {panels.map((panel, index) => {
              const active = index === selectedIndex;
              return (
                <section
                  key={panel.id}
                  id={`workspace-${panel.id}`}
                  style={
                    { "--face-angle": `${index * -90}deg` } as CSSProperties
                  }
                  className={`workspace-panel ${active ? "active" : "inactive"} ${!hasFile && index !== 0 ? "locked" : ""}`}
                  aria-label={panel.label}
                  aria-hidden={!active}
                  ref={(element) => {
                    element?.toggleAttribute("inert", !active);
                  }}
                >
                  <div className="workspace-panel-inner">{panel.content}</div>
                </section>
              );
            })}
            <div className="cube-back" aria-hidden="true" />
            <div className="cube-cap cube-cap-left" aria-hidden="true" />
            <div className="cube-cap cube-cap-right" aria-hidden="true" />
          </div>
        </div>
      </div>

      <SignalCables
        deckRef={deckRef}
        phase={dockPhase}
        activeIndex={selectedIndex}
      />
      <nav
        className="panel-nav-rail"
        aria-label="Transformer views"
        aria-disabled={!navigationEnabled}
      >
        <div className="panel-nav-port" aria-hidden="true" />
        <div className="panel-nav-handle">
          <span className="panel-nav-led" aria-hidden="true" />
          <div className="panel-nav-heading">
            <strong>VIEWS</strong>
            <small>
              {dockPhase === "docking"
                ? "CONNECTING"
                : dockPhase === "unplugging" || dockPhase === "retreating"
                  ? "DISCONNECTING"
                  : !hasFile
                    ? "NO MIDI SIGNAL"
                    : canNavigate
                      ? "SYSTEM ONLINE"
                      : "PROCESSING"}
            </small>
          </div>
        </div>
        <div className="panel-nav-menu">
          {panels.map((panel, index) => (
            <button
              type="button"
              key={panel.id}
              className={index === selectedIndex ? "active" : ""}
              aria-current={index === selectedIndex ? "true" : undefined}
              aria-controls={`workspace-${panel.id}`}
              disabled={!navigationEnabled}
              onClick={() => {
                if (navigationEnabled) onChange(index);
              }}
            >
              <span className="panel-nav-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="panel-nav-copy">
                <strong>{panel.label}</strong>
                {panel.description && <small>{panel.description}</small>}
              </span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="panel-readout" aria-live="polite">
          <span>
            {String(selectedIndex + 1).padStart(2, "0")} /{" "}
            {String(panels.length).padStart(2, "0")}
          </span>
        </div>
      </nav>
    </section>
  );
}
