-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('vendedor', 'gestor_atas', 'financeiro', 'admin');

-- CreateEnum
CREATE TYPE "StatusRepresentante" AS ENUM ('waiting_letter', 'active', 'waitlist', 'expired');

-- CreateEnum
CREATE TYPE "StatusOficio" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_marcas" (
    "usuarioId" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_marcas_pkey" PRIMARY KEY ("usuarioId","marcaId")
);

-- CreateTable
CREATE TABLE "atas" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "orgao" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "representantes" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "ataId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "status" "StatusRepresentante" NOT NULL DEFAULT 'waiting_letter',
    "waitingDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "representantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oficios" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "representanteId" TEXT NOT NULL,
    "status" "StatusOficio" NOT NULL DEFAULT 'pending',
    "arquivoRef" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autorizacoes_adesao" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "oficioId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autorizacoes_adesao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nome_key" ON "marcas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "atas_marcaId_idx" ON "atas"("marcaId");

-- CreateIndex
CREATE INDEX "representantes_marcaId_idx" ON "representantes"("marcaId");

-- CreateIndex
CREATE INDEX "representantes_ataId_idx" ON "representantes"("ataId");

-- CreateIndex
CREATE INDEX "oficios_marcaId_idx" ON "oficios"("marcaId");

-- CreateIndex
CREATE INDEX "oficios_representanteId_idx" ON "oficios"("representanteId");

-- CreateIndex
CREATE UNIQUE INDEX "autorizacoes_adesao_oficioId_key" ON "autorizacoes_adesao"("oficioId");

-- CreateIndex
CREATE UNIQUE INDEX "autorizacoes_adesao_numero_key" ON "autorizacoes_adesao"("numero");

-- CreateIndex
CREATE INDEX "autorizacoes_adesao_marcaId_idx" ON "autorizacoes_adesao"("marcaId");

-- AddForeignKey
ALTER TABLE "usuarios_marcas" ADD CONSTRAINT "usuarios_marcas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_marcas" ADD CONSTRAINT "usuarios_marcas_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atas" ADD CONSTRAINT "atas_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "representantes" ADD CONSTRAINT "representantes_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "representantes" ADD CONSTRAINT "representantes_ataId_fkey" FOREIGN KEY ("ataId") REFERENCES "atas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oficios" ADD CONSTRAINT "oficios_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oficios" ADD CONSTRAINT "oficios_representanteId_fkey" FOREIGN KEY ("representanteId") REFERENCES "representantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autorizacoes_adesao" ADD CONSTRAINT "autorizacoes_adesao_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autorizacoes_adesao" ADD CONSTRAINT "autorizacoes_adesao_oficioId_fkey" FOREIGN KEY ("oficioId") REFERENCES "oficios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
