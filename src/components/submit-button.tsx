"use client";

import { useFormStatus } from "react-dom";
import { button } from "./button-styles";

// Przycisk formularza zablokowany na czas wysyłania.
export function SubmitButton({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={button.primary}>
      {pending ? pendingLabel : children}
    </button>
  );
}
