/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Car` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CarImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_userId_fkey";

-- DropForeignKey
ALTER TABLE "CarImage" DROP CONSTRAINT "CarImage_carId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "whatsapp" TEXT;

-- DropTable
DROP TABLE "Car";

-- DropTable
DROP TABLE "CarImage";

-- CreateTable
CREATE TABLE "Anuncio" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "versao" TEXT,
    "anoFab" INTEGER NOT NULL,
    "anoMod" INTEGER NOT NULL,
    "km" INTEGER NOT NULL,
    "combustivel" TEXT NOT NULL,
    "cambio" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "portas" INTEGER,
    "blindado" BOOLEAN NOT NULL DEFAULT false,
    "financiamento" BOOLEAN NOT NULL DEFAULT true,
    "troca" BOOLEAN NOT NULL DEFAULT false,
    "preco" DOUBLE PRECISION NOT NULL,
    "fipe" DOUBLE PRECISION,
    "placa" TEXT,
    "descricao" TEXT,
    "plano" TEXT NOT NULL DEFAULT 'gratis',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "capa" BOOLEAN NOT NULL DEFAULT false,
    "anuncioId" TEXT NOT NULL,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
