import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Nesta versão do Next.js, `middleware.ts` foi renomeado para `proxy.ts`.
// Guarda de primeira linha (UX): redireciona quem não está logado para /login.
// A autorização de verdade (papel + marca) é sempre revalidada em cada Route
// Handler via requireRole() — nunca confiar só nesta camada.
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const dashboardPrefixes = [
    "/dashboard",
    "/atas",
    "/representantes",
    "/alertas",
    "/configuracoes",
    "/emails",
    "/whatsapp",
    "/instagram",
    "/anuncios",
  ];
  const isDashboardRoute = dashboardPrefixes.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix)
  );

  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/atas/:path*",
    "/representantes/:path*",
    "/alertas/:path*",
    "/configuracoes/:path*",
    "/emails/:path*",
    "/whatsapp/:path*",
    "/instagram/:path*",
    "/anuncios/:path*",
  ],
};
