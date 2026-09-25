import Image from "next/image";

type Person = { first_name: string; last_name: string; avatar_url: string | null };

const sizes = {
  sm: { px: 24, className: "size-6" },
  md: { px: 40, className: "size-10" },
  lg: { px: 200, className: "aspect-square w-full" },
};

// Zdjęcie profilowe; bez zdjęcia — inicjały. Kwadratowe, bez zaokrągleń (styl wczesnego FB).
// eager: dla zdjęcia widocznego od razu (LCP), np. głównego zdjęcia profilu.
export function Avatar({ person, size, eager }: { person: Person; size: keyof typeof sizes; eager?: boolean }) {
  const { px, className } = sizes[size];
  if (person.avatar_url) {
    return <Image src={person.avatar_url} alt="" width={px} height={px} loading={eager ? "eager" : "lazy"} className={`${className} shrink-0 border border-light object-cover`} />;
  }
  return (
    <span aria-hidden className={`${className} flex shrink-0 items-center justify-center border border-light bg-light text-xs font-bold text-primary`}>
      {person.first_name[0]}{person.last_name[0]}
    </span>
  );
}
