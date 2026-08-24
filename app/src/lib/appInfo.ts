// The screen title lives here, not in the component, so the walking skeleton has
// one piece of testable logic and the UI stays dumb (CLAUDE.md, code style).
export const APP_NAME = 'Almost There';

/** Title shown on the home screen. `stage` is appended when present. */
export function screenTitle(stage?: string): string {
  const trimmed = stage?.trim();
  return trimmed ? `${APP_NAME} — ${trimmed}` : APP_NAME;
}
