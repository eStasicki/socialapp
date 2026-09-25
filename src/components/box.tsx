// Sekcja w stylu wczesnego FB: jasnoniebieski nagłówek + ramka.
export function Box({ title, children, as: Tag = "h2" }: { title: React.ReactNode; children: React.ReactNode; as?: "h1" | "h2" }) {
  return (
    <section className="mb-4 border border-light">
      <Tag className="bg-light px-2 py-1 font-bold">{title}</Tag>
      {children}
    </section>
  );
}
