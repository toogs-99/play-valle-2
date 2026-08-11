-- CreateEnum
CREATE TYPE "StatusTemplateWhatsapp" AS ENUM ('aprovado', 'pendente', 'rejeitado');

-- CreateTable
CREATE TABLE "integracoes_whatsapp" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "wabaId" TEXT,
    "phoneNumberId" TEXT,
    "accessTokenCriptografado" TEXT,
    "tokenExpiraEm" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "ultimaSincronizacao" TIMESTAMP(3),
    "ultimoErro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integracoes_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_metricas" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "capturadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversasIniciadas" INTEGER NOT NULL,
    "mensagensEnviadas" INTEGER NOT NULL,
    "mensagensEntregues" INTEGER NOT NULL,
    "mensagensLidas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_metricas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_templates" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "StatusTemplateWhatsapp" NOT NULL,
    "categoria" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integracoes_whatsapp_marcaId_key" ON "integracoes_whatsapp"("marcaId");

-- CreateIndex
CREATE INDEX "whatsapp_metricas_marcaId_capturadoEm_idx" ON "whatsapp_metricas"("marcaId", "capturadoEm");

-- CreateIndex
CREATE INDEX "whatsapp_templates_marcaId_atualizadoEm_idx" ON "whatsapp_templates"("marcaId", "atualizadoEm");

-- AddForeignKey
ALTER TABLE "integracoes_whatsapp" ADD CONSTRAINT "integracoes_whatsapp_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_metricas" ADD CONSTRAINT "whatsapp_metricas_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
