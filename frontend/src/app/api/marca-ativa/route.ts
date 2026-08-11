import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMarcaAtiva, MARCA_ATIVA_COOKIE } from "@/lib/active-marca";

// Retorna a marca ativa atual (resolvida e validada no servidor).
export async function GET() {
  const marcaAtiva = await getMarcaAtiva();
  if (!marcaAtiva) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  return NextResponse.json({ marcaAtiva });
}

// Troca a marca ativa. Só aceita marcas às quais o usuário logado tem acesso.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const marcaId = body?.marcaId;

  if (typeof marcaId !== "string") {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const acesso = session.user.marcas.find((m) => m.marcaId === marcaId);
  if (!acesso) {
    return NextResponse.json(
      { error: "Usuário não tem acesso a esta marca." },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ marcaAtiva: acesso });
  response.cookies.set(MARCA_ATIVA_COOKIE, marcaId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
