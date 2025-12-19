/*
  Warnings:

  - The primary key for the `AnswerOption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AnswerOption` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `EmailLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `EmailLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `GivenAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `GivenAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `answerOptionId` column on the `GivenAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `nextYesId` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `nextNoId` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Test` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Test` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TestSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TestSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `questionId` on the `AnswerOption` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sessionId` on the `GivenAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `questionId` on the `GivenAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `testId` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `testId` on the `TestSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "AnswerOption" DROP CONSTRAINT "AnswerOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "GivenAnswer" DROP CONSTRAINT "GivenAnswer_answerOptionId_fkey";

-- DropForeignKey
ALTER TABLE "GivenAnswer" DROP CONSTRAINT "GivenAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "GivenAnswer" DROP CONSTRAINT "GivenAnswer_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_testId_fkey";

-- DropForeignKey
ALTER TABLE "TestSession" DROP CONSTRAINT "TestSession_testId_fkey";

-- AlterTable
ALTER TABLE "AnswerOption" DROP CONSTRAINT "AnswerOption_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "questionId",
ADD COLUMN     "questionId" INTEGER NOT NULL,
ADD CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EmailLog" DROP CONSTRAINT "EmailLog_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GivenAnswer" DROP CONSTRAINT "GivenAnswer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "sessionId",
ADD COLUMN     "sessionId" INTEGER NOT NULL,
DROP COLUMN "questionId",
ADD COLUMN     "questionId" INTEGER NOT NULL,
DROP COLUMN "answerOptionId",
ADD COLUMN     "answerOptionId" INTEGER,
ADD CONSTRAINT "GivenAnswer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "testId",
ADD COLUMN     "testId" INTEGER NOT NULL,
DROP COLUMN "nextYesId",
ADD COLUMN     "nextYesId" INTEGER,
DROP COLUMN "nextNoId",
ADD COLUMN     "nextNoId" INTEGER,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Test" DROP CONSTRAINT "Test_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Test_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TestSession" DROP CONSTRAINT "TestSession_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "testId",
ADD COLUMN     "testId" INTEGER NOT NULL,
ADD CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GivenAnswer" ADD CONSTRAINT "GivenAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GivenAnswer" ADD CONSTRAINT "GivenAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GivenAnswer" ADD CONSTRAINT "GivenAnswer_answerOptionId_fkey" FOREIGN KEY ("answerOptionId") REFERENCES "AnswerOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
