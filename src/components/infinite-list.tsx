"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { batchSize, VIEWPORT_COOKIE, type ItemKind } from "@/lib/viewport";

export type LoadMore = (offset: number, limit: number) => Promise<{ node: React.ReactNode; count: number; hasMore: boolean }>;

// Doczytuje porcje wielkości jednego ekranu, gdy znacznik na końcu listy zbliża się do okna.
export function InfiniteList({ load, initialCount, hasMore: initialHasMore, kind }: {
  load: LoadMore;
  initialCount: number;
  hasMore: boolean;
  kind: ItemKind;
}) {
  const t = useT();
  const [pages, setPages] = useState<React.ReactNode[]>([]);
  const [offset, setOffset] = useState(initialCount);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  // Wysokość okna dla serwera — pierwsza porcja przy następnym wejściu też ma rozmiar ekranu.
  useEffect(() => {
    const save = () => (document.cookie = `${VIEWPORT_COOKIE}=${window.innerHeight}; path=/; max-age=31536000; samesite=lax`);
    save();
    window.addEventListener("resize", save);
    return () => window.removeEventListener("resize", save);
  }, []);

  useEffect(() => {
    if (!hasMore || loading || failed || !sentinel.current) return;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setLoading(true);
        // Rozmiar liczony przy każdym doczytaniu — uwzględnia zmianę rozmiaru okna.
        try {
          const next = await load(offset, batchSize(window.innerHeight, kind));
          setPages((p) => [...p, next.node]);
          setOffset((o) => o + next.count);
          setHasMore(next.hasMore);
        } catch {
          // np. nowa wersja aplikacji po deployu/HMR — akcja z tej karty już nie istnieje
          setFailed(true);
        } finally {
          setLoading(false);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, loading, failed, offset, load, kind]);

  return (
    <>
      {pages.map((node, i) => <Fragment key={i}>{node}</Fragment>)}
      {hasMore && (
        <div ref={sentinel} role="status" className="p-2 text-center text-xs">
          {loading && t("common.loading")}
          {failed && (
            <>
              {t("common.loadFailed")}{" "}
              <button type="button" onClick={() => location.reload()} className="text-primary hover:underline">
                {t("common.reload")}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
