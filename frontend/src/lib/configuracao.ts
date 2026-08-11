import { prisma } from "@/lib/prisma";

const SINGLETON_ID = "singleton";

export async function getOrCreateConfiguracao() {
  return prisma.configuracao.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}
