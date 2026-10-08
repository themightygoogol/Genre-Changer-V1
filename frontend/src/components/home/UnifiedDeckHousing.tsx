import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export default function UnifiedDeckHousing({
  children,
}: {
  children: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  useLayoutEffect(() => {
    const host = hostRef.current;
    const deck = host?.querySelector<HTMLElement>(".turntable-deck");
    if (!host || !deck) return;
    const measure = () => {
      const next = { width: deck.offsetWidth, height: deck.offsetHeight };
      if (!next.width || !next.height) return;
      setSize((current) =>
        current &&
        current.width === next.width &&
        current.height === next.height
          ? current
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(deck);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children]);
  const style = size
    ? ({
        "--combo-module-width": `${size.width}px`,
        "--combo-module-height": `${size.height}px`,
      } as CSSProperties)
    : undefined;
  return (
    <div ref={hostRef} className="unified-genre-deck" style={style}>
      {children}
    </div>
  );
}
