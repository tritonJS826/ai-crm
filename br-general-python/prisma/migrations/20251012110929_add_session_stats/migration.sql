/*
  Warnings:

  - Added the required column `topicId` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "topicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TestSession" ADD COLUMN     "isFinished" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionStat" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionStat_sessionId_key_key" ON "SessionStat"("sessionId", "key");

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionStat" ADD CONSTRAINT "SessionStat_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
