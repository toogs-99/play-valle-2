-- CreateEnum
CREATE TYPE "StatusVenda" AS ENUM ('pendente', 'pago', 'cancelado');

-- AlterTable
ALTER TABLE "atas" ADD COLUMN     "valorAta" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "representanteId" TEXT NOT NULL,
    "ataId" TEXT NOT NULL,
    "oficioId" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "status" "StatusVenda" NOT NULL DEFAULT 'pendente',
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pagaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendas_oficioId_key" ON "vendas"("oficioId");

-- CreateIndex
CREATE INDEX "vendas_marcaId_idx" ON "vendas"("marcaId");

-- CreateIndex
CREATE INDEX "vendas_marcaId_status_idx" ON "vendas"("marcaId", "status");

-- CreateIndex
CREATE INDEX "vendas_representanteId_idx" ON "vendas"("representanteId");

-- CreateIndex
CREATE INDEX "vendas_ataId_idx" ON "vendas"("ataId");

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_representanteId_fkey" FOREIGN KEY ("representanteId") REFERENCES "representantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_ataId_fkey" FOREIGN KEY ("ataId") REFERENCES "atas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_oficioId_fkey" FOREIGN KEY ("oficioId") REFERENCES "oficios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
