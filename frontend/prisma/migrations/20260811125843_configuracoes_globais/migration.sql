-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "prazoPadraoDias" INTEGER NOT NULL DEFAULT 30,
    "limiteRepresentantesPorRegiao" INTEGER,
    "alertasEmailAtivo" BOOLEAN NOT NULL DEFAULT false,
    "alertasEmailDestinatarios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);
