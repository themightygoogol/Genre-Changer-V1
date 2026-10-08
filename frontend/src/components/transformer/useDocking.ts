import { useLayoutEffect, useRef, useState } from "react";
import { dockingTimeline, type DockPhase } from "./docking";

export function useDocking(fileIdentity: string | null): DockPhase {
  const hasFile = Boolean(fileIdentity);
  const [phase, setPhase] = useState<DockPhase>(hasFile ? "connected" : "idle");
  const previous = useRef(fileIdentity);
  useLayoutEffect(() => {
    if (previous.current === fileIdentity) return;
    previous.current = fileIdentity;
    const timeline = dockingTimeline(
      hasFile,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    setPhase(timeline[0].phase);
    const timers = timeline
      .slice(1)
      .map((step) => window.setTimeout(() => setPhase(step.phase), step.after));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [hasFile, fileIdentity]);
  return phase;
}
