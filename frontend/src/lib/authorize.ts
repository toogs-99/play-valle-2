import { NextResponse } from "next/server";
import { auth, type MarcaAcesso } from "@/auth";
import type { Papel } from "@prisma/client";

interface RequireRoleSuccess {
  error: null;
  usuarioId: string;
  papel: Papel;
  acesso: MarcaAcesso;
}

interface RequireRoleFailure {
  error: NextResponse;
}

type RequireRoleResult = RequireRoleSuccess | RequireRoleFailure;

/**
 * Garante que o usuário autenticado tem um dos papéis permitidos na marca informada.
 * Uso em Route Handlers:
 *   const check = await requireRole(marcaId, ["admin", "gestor_atas"]);
 *   if (check.error) return check.error;
 */
export async function requireRole(
  marcaId: string,
  papeisPermitidos: Papel[]
): Promise<RequireRoleResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }

  const acesso = session.user.marcas.find((m) => m.marcaId === marcaId);

  if (!acesso) {
    return {
      error: NextResponse.json(
        { error: "Usuário não tem acesso a esta marca." },
        { status: 403 }
      ),
    };
  }

  if (!papeisPermitidos.includes(acesso.papel)) {
    return {
      error: NextResponse.json(
        { error: `Papel "${acesso.papel}" não autorizado para esta ação.` },
        { status: 403 }
      ),
    };
  }

  return {
    error: null,
    usuarioId: session.user.id,
    papel: acesso.papel,
    acesso,
  };
}

interface RequireAuthSuccess {
  error: null;
  usuarioId: string;
  marcas: MarcaAcesso[];
}

interface RequireAuthFailure {
  error: NextResponse;
}

/**
 * Garante apenas que o usuário está autenticado, sem checar marca/papel.
 * Uso para recursos globais de leitura (não vinculados a uma marca específica).
 */
export async function requireAuthenticated(): Promise<RequireAuthSuccess | RequireAuthFailure> {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }

  return { error: null, usuarioId: session.user.id, marcas: session.user.marcas };
}

/**
 * Garante que o usuário é "admin" em pelo menos uma marca — usado para recursos
 * globais (não vinculados a uma marca específica) restritos a administradores.
 */
export async function requireGlobalAdmin(): Promise<RequireAuthSuccess | RequireAuthFailure> {
  const check = await requireAuthenticated();
  if (check.error) return check;

  const isAdminEmAlgumaMarca = check.marcas.some((m) => m.papel === "admin");
  if (!isAdminEmAlgumaMarca) {
    return {
      error: NextResponse.json(
        { error: "Apenas administradores podem realizar esta ação." },
        { status: 403 }
      ),
    };
  }

  return check;
}
