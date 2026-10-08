import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { DOCK_TIMING, type DockPhase } from "./docking";

interface CableGeometry {
  width: number;
  height: number;
  x: number;
  y: number;
  spacing: number;
  endX: number;
  endY: number;
  endSpacing: number;
  offset: number;
}
const parkedOffset = 32;
export default function SignalCables({
  deckRef,
  phase,
  activeIndex,
}: {
  deckRef: RefObject<HTMLElement | null>;
  phase: DockPhase;
  activeIndex: number;
}) {
  const offsetRef = useRef(phase === "connected" ? 0 : parkedOffset);
  const [geometry, setGeometry] = useState<CableGeometry | null>(null);
  useLayoutEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const started = performance.now();
    const from = offsetRef.current;
    const target =
      phase === "docking" || phase === "connected" ? 0 : parkedOffset;
    const delay = phase === "docking" ? DOCK_TIMING.plugDelay : 0;
    const duration =
      phase === "docking" ? DOCK_TIMING.plugDuration : DOCK_TIMING.unplug;
    let frame = 0;
    let disposed = false;
    const measure = (now: number) => {
      if (disposed) return;
      const chassis = deck.querySelector<HTMLElement>(
        ".workspace-panel.active .midi-machine, .workspace-panel.active .instrument-panel",
      );
      const rack = deck.querySelector<HTMLElement>(".panel-nav-rail");
      if (!chassis || !rack) return;
      const root = deck.getBoundingClientRect();
      const body = chassis.getBoundingClientRect();
      const destination = rack.getBoundingClientRect();
      const progress = reduced
        ? 1
        : Math.max(0, Math.min(1, (now - started - delay) / duration));
      const ease = 1 - Math.pow(1 - progress, 3);
      offsetRef.current = from + (target - from) * ease;
      setGeometry({
        width: root.width,
        height: root.height,
        x: body.right - root.left,
        y: body.top + body.height / 2 - root.top,
        spacing: Math.min(40, body.height * 0.12),
        endX: destination.left - root.left,
        endY: destination.top + destination.height / 2 - root.top,
        endSpacing: 18,
        offset: offsetRef.current,
      });

      if (!reduced && now - started < 1300)
        frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(deck);
    measure(started);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [deckRef, phase, activeIndex]);
  if (!geometry) return null;
  const { width, height, x, y, spacing, endX, endY, endSpacing, offset } =
    geometry;
  return (
    <svg
      className={`signal-cables cables-${phase}`}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {[-1, 0, 1].map((lane, index) => {
        const startX = x + offset;
        const startY = y + lane * spacing;
        const finishY = endY + lane * endSpacing;
        const bendX = startX + (endX - startX) * 0.65;
        const route = `M ${startX + 10} ${startY} C ${bendX} ${startY}, ${bendX} ${finishY}, ${endX} ${finishY}`;
        return (
          <g key={lane}>
            <path className="signal-wire" d={route} />
            <path
              className="signal-pulse"
              pathLength="100"
              style={{ animationDelay: `${index * -0.8}s` }}
              d={route}
            />
            <g
              className="signal-plug"
              transform={`translate(${startX}, ${startY})`}
            >
              <rect
                className="plug-pin"
                x="-5"
                y="-2"
                width="6"
                height="4"
                rx="1"
              />
              <rect
                className="plug-body"
                x="0"
                y="-5"
                width="12"
                height="10"
                rx="2"
              />
              <path className="plug-grip" d="M 4 -3 V 3 M 7 -3 V 3" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
