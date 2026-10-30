-- CreateEnum
CREATE TYPE "TipoEmpenho" AS ENUM ('nota_empenho', 'ordem_compra');

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "ataId" TEXT NOT NULL,
    "representanteId" TEXT,
    "numero" TEXT NOT NULL,
    "valorSolicitado" DECIMAL(12,2) NOT NULL,
    "valorContratado" DECIMAL(12,2) NOT NULL,
    "assinadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empenhos" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "tipo" "TipoEmpenho" NOT NULL,
    "numero" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "emitidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empenhos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contratos_marcaId_idx" ON "contratos"("marcaId");

-- CreateIndex
CREATE INDEX "contratos_ataId_idx" ON "contratos"("ataId");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_marcaId_numero_key" ON "contratos"("marcaId", "numero");

-- CreateIndex
CREATE INDEX "empenhos_contratoId_idx" ON "empenhos"("contratoId");

-- CreateIndex
CREATE UNIQUE INDEX "empenhos_contratoId_numero_key" ON "empenhos"("contratoId", "numero");

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_ataId_fkey" FOREIGN KEY ("ataId") REFERENCES "atas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_representanteId_fkey" FOREIGN KEY ("representanteId") REFERENCES "representantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empenhos" ADD CONSTRAINT "empenhos_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

