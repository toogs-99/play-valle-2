import { extractText, getDocumentProxy } from "unpdf";

export interface ItemAtaBusca {
  id: string;
  descricao: string;
}

export interface ItemSugerido {
  itemAtaId: string;
  quantidade: number;
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Procura, no texto do ofício, os produtos da ata e a quantidade ao lado de
 * cada um. Só devolve o que achou com segurança (descrição inteira presente no
 * texto e um número perto dela); o restante fica para lançamento manual.
 */
export function sugerirItens(texto: string, itensAta: ItemAtaBusca[]): ItemSugerido[] {
  const base = normalizar(texto);
  const sugeridos: ItemSugerido[] = [];

  for (const item of itensAta) {
    const desc = normalizar(item.descricao);
    if (!desc) continue;
    const pos = base.indexOf(desc);
    if (pos === -1) continue;

    const antes = base.slice(Math.max(0, pos - 25), pos);
    const depois = base.slice(pos + desc.length, pos + desc.length + 40);

    // "10 balanço duplo", "10 un de balanço duplo", "balanço duplo: 10",
    // "balanço duplo - qtd 10"
    const reAntes = /(\d{1,6})\s*(?:(?:un|und|unid\w*|pc|pcs|pecas?)\.?\s*)?(?:de\s+|x\s+)?$/;
    const reDepois = /^\s*[:\-–(x]*\s*(?:qtd\.?|quantidade|qde\.?)?\s*[:\-–]?\s*(\d{1,6})\b/;
    const q = antes.match(reAntes)?.[1] ?? depois.match(reDepois)?.[1];
    const quantidade = q ? Number(q) : 0;
    if (quantidade > 0) sugeridos.push({ itemAtaId: item.id, quantidade });
  }

  return sugeridos;
}

export async function extrairTextoPdf(base64: string): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(Buffer.from(base64, "base64")));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}
