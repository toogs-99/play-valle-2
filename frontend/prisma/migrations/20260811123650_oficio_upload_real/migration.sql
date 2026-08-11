/*
  Warnings:

  - You are about to drop the column `arquivoRef` on the `oficios` table. All the data in the column will be lost.
  - Added the required column `arquivoBase64` to the `oficios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arquivoMimeType` to the `oficios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arquivoNomeOriginal` to the `oficios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "oficios" DROP COLUMN "arquivoRef",
ADD COLUMN     "arquivoBase64" TEXT NOT NULL,
ADD COLUMN     "arquivoMimeType" TEXT NOT NULL,
ADD COLUMN     "arquivoNomeOriginal" TEXT NOT NULL;
