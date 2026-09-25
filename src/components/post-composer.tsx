import { addPost } from "@/app/(app)/compose";
import { getServerT } from "@/i18n/server";
import { SubmitButton } from "./submit-button";

// Nowy post na tablicy (własnej/znajomego) albo w grupie. Pole czyści się samo po udanym wysłaniu (React 19).
export async function PostComposer({ kind, targetId, placeholder }: { kind: "wall" | "group"; targetId: string; placeholder: string }) {
  const t = await getServerT();
  return (
    <form action={addPost.bind(null, kind, targetId)} className="flex flex-col gap-2 border-b border-light p-2">
      <label htmlFor={`compose-${kind}`} className="sr-only">{placeholder}</label>
      <textarea
        id={`compose-${kind}`}
        name="body"
        required
        maxLength={5000}
        rows={2}
        placeholder={placeholder}
        className="w-full resize-y border border-light bg-bg p-2 text-sm"
      />
      <div className="flex justify-end">
        <SubmitButton pendingLabel={t("compose.sending")}>{t("compose.share")}</SubmitButton>
      </div>
    </form>
  );
}
