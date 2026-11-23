-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('contrato', 'empenho');

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "itemAtaId" TEXT,
ADD COLUMN     "quantidade" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "itens_ata" (
    "id" TEXT NOT NULL,
    "ataId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_ata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL,
    "ataId" TEXT NOT NULL,
    "tipo" "TipoContrato" NOT NULL DEFAULT 'empenho',
    "numero" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_contrato" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "itemAtaId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "itens_contrato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "itens_ata_ataId_idx" ON "itens_ata"("ataId");

-- CreateIndex
CREATE INDEX "contratos_ataId_idx" ON "contratos"("ataId");

-- CreateIndex
CREATE INDEX "itens_contrato_contratoId_idx" ON "itens_contrato"("contratoId");

-- CreateIndex
CREATE INDEX "itens_contrato_itemAtaId_idx" ON "itens_contrato"("itemAtaId");

-- CreateIndex
CREATE INDEX "vendas_itemAtaId_idx" ON "vendas"("itemAtaId");

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_itemAtaId_fkey" FOREIGN KEY ("itemAtaId") REFERENCES "itens_ata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_ata" ADD CONSTRAINT "itens_ata_ataId_fkey" FOREIGN KEY ("ataId") REFERENCES "atas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_ataId_fkey" FOREIGN KEY ("ataId") REFERENCES "atas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_contrato" ADD CONSTRAINT "itens_contrato_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_contrato" ADD CONSTRAINT "itens_contrato_itemAtaId_fkey" FOREIGN KEY ("itemAtaId") REFERENCES "itens_ata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

