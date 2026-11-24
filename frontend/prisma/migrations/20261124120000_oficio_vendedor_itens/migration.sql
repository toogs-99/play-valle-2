-- AlterTable
ALTER TABLE "oficios" ADD COLUMN     "vendedorId" TEXT;

-- CreateTable
CREATE TABLE "itens_oficio" (
    "id" TEXT NOT NULL,
    "oficioId" TEXT NOT NULL,
    "itemAtaId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_oficio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "itens_oficio_itemAtaId_idx" ON "itens_oficio"("itemAtaId");

-- CreateIndex
CREATE UNIQUE INDEX "itens_oficio_oficioId_itemAtaId_key" ON "itens_oficio"("oficioId", "itemAtaId");

-- CreateIndex
CREATE INDEX "oficios_vendedorId_idx" ON "oficios"("vendedorId");

-- AddForeignKey
ALTER TABLE "oficios" ADD CONSTRAINT "oficios_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_oficio" ADD CONSTRAINT "itens_oficio_oficioId_fkey" FOREIGN KEY ("oficioId") REFERENCES "oficios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_oficio" ADD CONSTRAINT "itens_oficio_itemAtaId_fkey" FOREIGN KEY ("itemAtaId") REFERENCES "itens_ata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

