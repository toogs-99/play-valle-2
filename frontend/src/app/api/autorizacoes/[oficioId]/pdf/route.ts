import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ oficioId: string }> }
) {
  const { oficioId } = await params;

  const autorizacao = await prisma.autorizacaoAdesao.findUnique({
    where: { oficioId },
    include: {
      marca: { select: { nome: true } },
      oficio: {
        select: {
          representante: {
            select: {
              nome: true,
              cidade: true,
              ata: { select: { numero: true, orgao: true } },
            },
          },
        },
      },
    },
  });

  if (!autorizacao) {
    return NextResponse.json({ error: "Autorização não encontrada." }, { status: 404 });
  }

  const check = await requireRole(autorizacao.marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const { representante } = autorizacao.oficio;
  const dataEmissao = autorizacao.dataEmissao.toLocaleDateString("pt-BR");

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const marginX = 20;
  let y = 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CERTIFICADO DE AUTORIZAÇÃO DE ADESÃO", pageWidth / 2, y, { align: "center" });

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(autorizacao.marca.nome, pageWidth / 2, y, { align: "center" });

  y += 16;
  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 14;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);

  const linhas: Array<[string, string]> = [
    ["Nº do Certificado", autorizacao.numero],
    ["Representante Autorizado", representante.nome],
    ["Cidade Autorizada", representante.cidade],
    ["Ata de Registro de Preços", representante.ata.numero],
    ["Órgão Gerenciador", representante.ata.orgao],
    ["Data de Emissão", dataEmissao],
  ];

  for (const [label, valor] of linhas) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(valor, marginX + 65, y);
    y += 9;
  }

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const corpo = doc.splitTextToSize(
    `Certificamos, para os devidos fins, que o representante acima identificado está autorizado a atuar na cota de fornecimento referente à cidade e Ata de Registro de Preços indicadas, conforme ofício de adesão homologado.`,
    pageWidth - marginX * 2
  );
  doc.text(corpo, marginX, y);

  const bytes = doc.output("arraybuffer");

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Certificado_${autorizacao.numero}.pdf"`,
    },
  });
}
