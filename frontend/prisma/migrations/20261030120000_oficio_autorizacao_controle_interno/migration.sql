-- AlterTable
ALTER TABLE "oficios" ADD COLUMN     "autorizacaoArquivoBase64" TEXT,
ADD COLUMN     "autorizacaoArquivoEnviadoEm" TIMESTAMP(3),
ADD COLUMN     "autorizacaoArquivoMimeType" TEXT,
ADD COLUMN     "autorizacaoArquivoNome" TEXT;
