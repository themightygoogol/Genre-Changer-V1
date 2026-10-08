type ScrewVariant = "machine" | "deck" | "screen";
const variants = {
  machine: {
    element: "span",
    screw: "machine-screw",
    corners: ["screw-tl", "screw-tr", "screw-bl", "screw-br"],
  },
  deck: {
    element: "div",
    screw: "deck-screw",
    corners: [
      "screw-top-right",
      "screw-bottom-right",
    ],
  },
  screen: {
    element: "span",
    screw: "screen-chassis-screw",
    corners: ["screen-screw-tl", "screen-screw-bl"],
  },
} as const;
export default function HardwareScrews({
  variant = "machine",
}: {
  variant?: ScrewVariant;
}) {
  const { element: Element, screw, corners } = variants[variant];
  return (
    <>
      {corners.map((corner) => (
        <Element
          key={corner}
          className={screw + " " + corner}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
