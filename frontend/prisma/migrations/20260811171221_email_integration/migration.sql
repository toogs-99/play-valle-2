-- CreateEnum
CREATE TYPE "StatusEmailEnviado" AS ENUM ('enviado', 'falhou');

-- CreateTable
CREATE TABLE "integracoes_email" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUsuario" TEXT,
    "smtpSenhaCriptografada" TEXT,
    "smtpSeguro" BOOLEAN NOT NULL DEFAULT true,
    "emailRemetente" TEXT,
    "nomeRemetente" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "ultimoErro" TEXT,
    "ultimaSincronizacao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integracoes_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails_enviados" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "status" "StatusEmailEnviado" NOT NULL,
    "erro" TEXT,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contexto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emails_enviados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integracoes_email_marcaId_key" ON "integracoes_email"("marcaId");

-- CreateIndex
CREATE INDEX "emails_enviados_marcaId_enviadoEm_idx" ON "emails_enviados"("marcaId", "enviadoEm");

-- AddForeignKey
ALTER TABLE "integracoes_email" ADD CONSTRAINT "integracoes_email_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails_enviados" ADD CONSTRAINT "emails_enviados_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
