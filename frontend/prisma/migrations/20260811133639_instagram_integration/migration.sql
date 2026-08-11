-- CreateTable
CREATE TABLE "integracoes_meta" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "instagramContaId" TEXT,
    "accessTokenCriptografado" TEXT,
    "tokenExpiraEm" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "ultimaSincronizacao" TIMESTAMP(3),
    "ultimoErro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integracoes_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_metricas" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "capturadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seguidores" INTEGER NOT NULL,
    "alcance" INTEGER NOT NULL,
    "impressoes" INTEGER NOT NULL,
    "engajamento" DOUBLE PRECISION NOT NULL,
    "curtidas" INTEGER NOT NULL,
    "comentarios" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instagram_metricas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integracoes_meta_marcaId_key" ON "integracoes_meta"("marcaId");

-- CreateIndex
CREATE INDEX "instagram_metricas_marcaId_capturadoEm_idx" ON "instagram_metricas"("marcaId", "capturadoEm");

-- AddForeignKey
ALTER TABLE "integracoes_meta" ADD CONSTRAINT "integracoes_meta_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_metricas" ADD CONSTRAINT "instagram_metricas_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
