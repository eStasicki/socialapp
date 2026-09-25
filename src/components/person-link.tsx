import Link from "next/link";
import { fullName, profileHref } from "@/lib/format";

export function PersonLink({ person }: { person: { public_id: string; first_name: string; last_name: string } }) {
  return (
    <Link href={profileHref(person)} className="font-bold text-primary hover:underline">
      {fullName(person)}
    </Link>
  );
}
