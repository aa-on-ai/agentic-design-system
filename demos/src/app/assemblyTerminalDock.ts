export const TERMINAL_DOCK_GAP = 20;

const TERMINAL_APPROACH_GAP = 128;
const TERMINAL_SETTLED_GAP = 16;

export type TerminalDockState = "none" | "approaching" | "docked";
export type TerminalDockSide = "none" | "left" | "right";

type TerminalDockGeometry = {
  figureBaseBottom: number;
  figureBaseLeft: number;
  figureWidth: number;
  signLeft: number;
  signRight: number;
  signTop: number;
  viewportWidth: number;
};

type TerminalDock = {
  progress: number;
  side: TerminalDockSide;
  state: TerminalDockState;
  x: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const resolveTerminalDock = ({ figureBaseBottom, figureBaseLeft, figureWidth, signLeft, signRight, signTop, viewportWidth }: TerminalDockGeometry): TerminalDock => {
  const verticalGap = signTop - figureBaseBottom;
  const progress = clamp((TERMINAL_APPROACH_GAP - verticalGap) / (TERMINAL_APPROACH_GAP - TERMINAL_SETTLED_GAP), 0, 1);

  if (progress === 0) return { progress, side: "none", state: "none", x: 0 };

  const rightTargetLeft = signRight + TERMINAL_DOCK_GAP;
  const leftTargetLeft = signLeft - TERMINAL_DOCK_GAP - figureWidth;
  const rightFits = rightTargetLeft + figureWidth <= viewportWidth + 0.5;
  const leftFits = leftTargetLeft >= -0.5;
  const side: Exclude<TerminalDockSide, "none"> = rightFits || !leftFits ? "right" : "left";
  const targetLeft = side === "right" ? rightTargetLeft : leftTargetLeft;

  return {
    progress,
    side,
    state: progress === 1 ? "docked" : "approaching",
    x: (targetLeft - figureBaseLeft) * progress,
  };
};
