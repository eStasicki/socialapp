import "server-only";
import { cookies } from "next/headers";
import { batchSize, DEFAULT_VIEWPORT, VIEWPORT_COOKIE, type ItemKind } from "./viewport";

// Rozmiar pierwszej porcji renderowanej na serwerze — z wysokości okna zapisanej przez <InfiniteList>.
export async function firstBatch(kind: ItemKind) {
  const vh = Number((await cookies()).get(VIEWPORT_COOKIE)?.value);
  return { offset: 0, limit: batchSize(vh > 0 && vh < 10_000 ? vh : DEFAULT_VIEWPORT, kind) };
}
