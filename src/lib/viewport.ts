// Porcje list dopasowane do wysokości okna: tyle elementów, ile mniej więcej mieści się na ekranie (+1 zapasu).
export const VIEWPORT_COOKIE = "vh";
export const DEFAULT_VIEWPORT = 900;
export const MAX_BATCH = 50;

// ponytail: szacowana wysokość elementu; pomiar rzeczywistych wysokości, jeśli szacunek okaże się za słaby
export const ITEM_HEIGHT = { post: 160, notification: 56 } as const;
export type ItemKind = keyof typeof ITEM_HEIGHT;

export function batchSize(viewportHeight: number, kind: ItemKind) {
  return Math.min(MAX_BATCH, Math.max(3, Math.ceil(viewportHeight / ITEM_HEIGHT[kind]) + 1));
}
