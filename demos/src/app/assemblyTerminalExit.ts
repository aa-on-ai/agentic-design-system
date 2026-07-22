const TERMINAL_APPROACH_DISTANCE = 128;

export type TerminalExitState = "none" | "occluding" | "exited";

type TerminalExitGeometry = {
  figureBaseBottom: number;
  signBottom: number;
  signTop: number;
};

type TerminalExit = {
  approachProgress: number;
  state: TerminalExitState;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const resolveTerminalExit = ({ figureBaseBottom, signBottom, signTop }: TerminalExitGeometry): TerminalExit => {
  const verticalGap = signTop - figureBaseBottom;
  const approachProgress = clamp((TERMINAL_APPROACH_DISTANCE - verticalGap) / TERMINAL_APPROACH_DISTANCE, 0, 1);

  if (signTop >= figureBaseBottom) return { approachProgress, state: "none" };
  if (signBottom > figureBaseBottom) return { approachProgress, state: "occluding" };
  return { approachProgress: 1, state: "exited" };
};
