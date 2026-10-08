export type DockPhase =
  "idle" | "docking" | "connected" | "unplugging" | "retreating";
export const DOCK_TIMING = {
  plugDelay: 250,
  plugDuration: 700,
  connected: 1100,
  unplug: 300,
  retreat: 1000,
} as const;

export function dockingTimeline(
  hasFile: boolean,
  reducedMotion = false,
): { phase: DockPhase; after: number }[] {
  if (reducedMotion)
    return [{ phase: hasFile ? "connected" : "idle", after: 0 }];
  return hasFile
    ? [
        { phase: "docking", after: 0 },
        { phase: "connected", after: DOCK_TIMING.connected },
      ]
    : [
        { phase: "unplugging", after: 0 },
        { phase: "retreating", after: DOCK_TIMING.unplug },
        { phase: "idle", after: DOCK_TIMING.unplug + DOCK_TIMING.retreat },
      ];
}
