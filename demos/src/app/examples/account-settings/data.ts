export const models = {
  astra: { name: "GPT-6 Astra", id: "gpt-6-astra", description: "High reasoning", baseline: "A", ads: "C", notes: "The version without ADS uses smaller desktop text and a color-only avatar picker. The version with ADS keeps its save bar visible, even when there are no edits." },
  fable: { name: "Claude Fable 5.2", id: "claude-fable-5-2", description: "High effort", baseline: "B", ads: "D", notes: "Without ADS, some security and session changes reset on reload. With ADS, photos save immediately while text fields need Save; its desktop storage-error message can fall below the fold." },
  opus: { name: "Claude Opus 5.5", id: "claude-opus-5-5", description: "High effort", baseline: "F", ads: "E", notes: "Without ADS, some touch controls are small and Help only jumps to the content. With ADS, Discard loses focus in WebKit at phone size; the desktop retry button can move below the fold." },
} as const;
export type Model = keyof typeof models;
export const modelKey = (value?: string): Model => value && Object.hasOwn(models, value) ? value as Model : "astra";
export const assetRoot = "/examples/account-settings";
