import { prisma } from "@/lib/prisma";

export interface AlertaRepresentante {
  id: string;
  nome: string;
  cidade: string;
  waitingDeadline: Date;
  ataNumero: string;
}

export interface AlertasMarca {
  prazosVencidos: AlertaRepresentante[];
  aguardandoOficio: AlertaRepresentante[];
}

/**
 * Replica a lógica hoje usada no painel de Alertas (representantes com status
 * "expired" e "waiting_letter"), mas consultando o banco real em vez do
 * useAtas()/localStorage — usado pela rotina de e-mail de alertas.
 */
export async function calcularAlertas(marcaId: string): Promise<AlertasMarca> {
  const representantes = await prisma.representante.findMany({
    where: { marcaId, status: { in: ["expired", "waiting_letter"] } },
    include: { ata: { select: { numero: true } } },
    orderBy: { waitingDeadline: "asc" },
  });

  const prazosVencidos: AlertaRepresentante[] = [];
  const aguardandoOficio: AlertaRepresentante[] = [];

  for (const rep of representantes) {
    const item: AlertaRepresentante = {
      id: rep.id,
      nome: rep.nome,
      cidade: rep.cidade,
      waitingDeadline: rep.waitingDeadline,
      ataNumero: rep.ata.numero,
    };
    if (rep.status === "expired") {
      prazosVencidos.push(item);
    } else {
      aguardandoOficio.push(item);
    }
  }

  return { prazosVencidos, aguardandoOficio };
}

export function montarCorpoAlertas(marcaNome: string, alertas: AlertasMarca): string {
  const linhas: string[] = [
    `Resumo de alertas de prazo — ${marcaNome}`,
    "",
  ];

  if (alertas.prazosVencidos.length > 0) {
    linhas.push(`PRAZOS EXPIRADOS (${alertas.prazosVencidos.length}):`);
    for (const rep of alertas.prazosVencidos) {
      linhas.push(
        `- ${rep.nome} (${rep.cidade}) — ${rep.ataNumero} — venceu em ${rep.waitingDeadline.toLocaleDateString("pt-BR")}`
      );
    }
    linhas.push("");
  }

  if (alertas.aguardandoOficio.length > 0) {
    linhas.push(`AGUARDANDO ENVIO DE OFÍCIO (${alertas.aguardandoOficio.length}):`);
    for (const rep of alertas.aguardandoOficio) {
      linhas.push(
        `- ${rep.nome} (${rep.cidade}) — ${rep.ataNumero} — prazo: ${rep.waitingDeadline.toLocaleDateString("pt-BR")}`
      );
    }
    linhas.push("");
  }

  linhas.push("Acesse o LicitFlow para mais detalhes.");

  return linhas.join("\n");
}
