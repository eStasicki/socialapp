"use client";

import { useEffect } from "react";

// Oznacza jako przeczytane po faktycznym wyświetleniu strony (nie przy prefetchu).
export function MarkRead({ action }: { action: () => Promise<void> }) {
  useEffect(() => {
    action();
  }, [action]);
  return null;
}
