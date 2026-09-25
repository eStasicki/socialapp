import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isMock } from "@/lib/env";

const PUBLIC_PATHS = ["/login"];

function guard(request: NextRequest, loggedIn: boolean, response: NextResponse) {
  const isPublic = PUBLIC_PATHS.includes(request.nextUrl.pathname);
  if (!loggedIn && !isPublic) return NextResponse.redirect(new URL("/login", request.url));
  return response;
}

// Odświeża sesję Supabase i przekierowuje niezalogowanych na /login.
// Kontrola optymistyczna — faktyczną autoryzację robią strony (getCurrentUser) i RLS.
export async function proxy(request: NextRequest) {
  if (isMock) return guard(request, request.cookies.has("mock_session"), NextResponse.next({ request }));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  return guard(request, !!data.user, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
