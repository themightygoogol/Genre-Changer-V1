import { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./StudioHome.css";
import "./HomeVinylPromptFix.css";
import "./HomeHologramCredit.css";

export default function HomeVinylPrompt({
  colour,
  isSpinning,
}: {
  colour: string;
  isSpinning: boolean;
}) {
  const anchor = useRef<HTMLSpanElement>(null);
  const id = useId().replace(/:/g, "");
  const [beam, setBeam] = useState<{
    host: HTMLElement;
    left: number;
    top: number;
    width: number;
    height: number;
    cutoutRx: number;
    cutoutRy: number;
  } | null>(null);
  useLayoutEffect(() => {
    const home = anchor.current?.closest(".home-page");
    if (!home) return;
    let host: HTMLElement | null = null;
    let disc: HTMLElement | null = null;
    let text: HTMLElement | null = null;
    const measure = () => {
      if (!host || !disc || !text) {
        setBeam(null);
        return;
      }
      const a = host.getBoundingClientRect();
      const b = disc.getBoundingClientRect();
      const c = text.getBoundingClientRect();
      const sx = a.width / Math.max(1, host.offsetWidth);
      const sy = a.height / Math.max(1, host.offsetHeight);
      if (!sx || !sy) return;
      const width = Math.max(100, c.width / sx);
      const sourceX = (b.left + b.width / 2 - a.left) / sx;
      const top = (c.bottom - a.top) / sy;
      const height = Math.max(1, (b.top + b.height / 2 - a.top) / sy - top);
      const button = host.querySelector<HTMLElement>(".shift-button");
      const buttonRect = button?.getBoundingClientRect();
      const next = {
        host,
        left: sourceX - width / 2,
        top,
        width,
        height,
        cutoutRx: buttonRect
          ? ((buttonRect.width / sx / 2 + 2) / width) * 200
          : 0,
        cutoutRy: buttonRect
          ? ((buttonRect.height / sy / 2 + 2) / height) * 100
          : 0,
      };
      setBeam((current) =>
        current &&
        current.host === next.host &&
        current.left === next.left &&
        current.top === next.top &&
        current.width === next.width &&
        current.height === next.height &&
        current.cutoutRx === next.cutoutRx &&
        current.cutoutRy === next.cutoutRy
          ? current
          : next,
      );
    };
    const resize = new ResizeObserver(measure);
    const refresh = () => {
      const nextHost = home.querySelector<HTMLElement>(".platter-section");
      const nextDisc = home.querySelector<HTMLElement>(".vinyl-disc");
      const nextText = home.querySelector<HTMLElement>(".genre-hologram");
      if (host !== nextHost || disc !== nextDisc || text !== nextText) {
        resize.disconnect();
        host = nextHost;
        disc = nextDisc;
        text = nextText;
        for (const node of [host, disc, text]) if (node) resize.observe(node);
      }
      measure();
    };

    const mutation = new MutationObserver(refresh);
    mutation.observe(home, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });
    window.addEventListener("resize", refresh);
    refresh();
    return () => {
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener("resize", refresh);
    };
  }, []);
  return (
    <>
      <span ref={anchor} hidden />
      {beam && !isSpinning &&
        createPortal(
          <div
            className="venue-prompt-beam"
            style={{
              left: beam.left,
              top: beam.top,
              width: beam.width,
              height: beam.height,
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`beam-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={colour} stopOpacity=".12" />
                  <stop offset="1" stopColor={colour} stopOpacity=".025" />
                </linearGradient>
                <mask
                  id={`button-mask-${id}`}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="200"
                  height="100"
                >
                  <rect width="200" height="100" fill="white" />
                  <ellipse
                    cx="100"
                    cy="100"
                    rx={beam.cutoutRx}
                    ry={beam.cutoutRy}
                    fill="black"
                  />
                </mask>
              </defs>
              <g mask={`url(#button-mask-${id})`}>
                <path d="M 0 0 L 100 100 L 200 0 Z" fill={`url(#beam-${id})`} />
                <path
                  d="M 0 0 L 100 100 L 200 0"
                  fill="none"
                  stroke={colour}
                  strokeOpacity=".28"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            </svg>
          </div>,
          beam.host,
        )}
    </>
  );
}
