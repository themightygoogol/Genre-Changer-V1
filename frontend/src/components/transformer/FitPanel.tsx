import "./FitPanel.css";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export default function FitPanel({
  children,
  expanded,
}: {
  children: ReactNode;
  expanded: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, shift: 0 });
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      const projection = inner.querySelector<HTMLElement>(
        ".drill-instruction-hologram",
      );
      const space = expanded ? (projection?.offsetHeight ?? 205) + 12 : 0;
      const scale = Math.min(
        1,
        outer.clientWidth / Math.max(1, inner.offsetWidth),
        outer.clientHeight / Math.max(1, inner.offsetHeight + space),
      );
      setFit((current) =>
        Math.abs(current.scale - scale) < 0.0001 &&
        Math.abs(current.shift - (space * scale) / 2) < 0.01
          ? current
          : { scale, shift: (space * scale) / 2 },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    measure();
    return () => observer.disconnect();
  }, [expanded]);
  return (
    <div className="fit-panel" ref={outerRef}>
      <div
        className="fit-panel-content"
        ref={innerRef}
        style={{
          transform: `translate(-50%, -50%) translateY(${fit.shift}px) scale(${fit.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
