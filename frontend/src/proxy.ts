import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Nesta versão do Next.js, `middleware.ts` foi renomeado para `proxy.ts`.
// Guarda de primeira linha (UX): redireciona quem não está logado para /login.
// A autorização de verdade (papel + marca) é sempre revalidada em cada Route
// Handler via requireRole() — nunca confiar só nesta camada.
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/atas") ||
    req.nextUrl.pathname.startsWith("/representantes") ||
    req.nextUrl.pathname.startsWith("/alertas") ||
    req.nextUrl.pathname.startsWith("/configuracoes");

  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/atas/:path*", "/representantes/:path*", "/alertas/:path*", "/configuracoes/:path*"],
};
