/*
  Warnings:

  - Added the required column `source` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Source" AS ENUM ('CUSTOMER', 'AGENT', 'SYSTEM');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "source" "Source" NOT NULL;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "source" "Source" NOT NULL;

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "suggestions_conversation_id_createdAt_idx" ON "suggestions"("conversation_id", "createdAt");

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
