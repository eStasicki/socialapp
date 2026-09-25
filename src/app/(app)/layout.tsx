import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Nav } from "@/components/nav";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <>
      <Header user={user} />
      <div className="mx-auto flex max-w-[980px] gap-4 px-4 py-4">
        <aside className="hidden w-36 shrink-0 md:block">
          <Nav user={user} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
