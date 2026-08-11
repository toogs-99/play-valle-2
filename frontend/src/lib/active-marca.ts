import { cookies } from "next/headers";
import { auth, type MarcaAcesso } from "@/auth";

export const MARCA_ATIVA_COOKIE = "licitflow_marca_ativa";

/**
 * Resolve a marca ativa do usuário no servidor, cruzando o cookie com as
 * marcas que a sessão autenticada realmente permite acessar. O cookie é só
 * uma preferência de UI — nunca é confiado sozinho, sempre revalidado aqui.
 */
export async function getMarcaAtiva(): Promise<MarcaAcesso | null> {
  const session = await auth();
  if (!session?.user || session.user.marcas.length === 0) return null;

  const cookieStore = await cookies();
  const marcaIdCookie = cookieStore.get(MARCA_ATIVA_COOKIE)?.value;

  const acessoCookie = marcaIdCookie
    ? session.user.marcas.find((m) => m.marcaId === marcaIdCookie)
    : undefined;

  // Se o cookie aponta para uma marca que o usuário não tem mais acesso
  // (ou não existe cookie ainda), cai para a primeira marca disponível.
  return acessoCookie ?? session.user.marcas[0];
}
