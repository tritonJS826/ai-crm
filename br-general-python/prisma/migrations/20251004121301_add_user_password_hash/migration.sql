/*
  Warnings:

  - The primary key for the `AnswerOption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EmailLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GivenAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Test` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TestSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `hashed_password` to the `User` table without a default value. This is not possible if the table is not empty.

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
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "TestSession" DROP CONSTRAINT "TestSession_testId_fkey";

-- DropForeignKey
ALTER TABLE "TestSession" DROP CONSTRAINT "TestSession_userId_fkey";

-- AlterTable
ALTER TABLE "AnswerOption" DROP CONSTRAINT "AnswerOption_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AnswerOption_id_seq";

-- AlterTable
ALTER TABLE "EmailLog" DROP CONSTRAINT "EmailLog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EmailLog_id_seq";

-- AlterTable
ALTER TABLE "GivenAnswer" DROP CONSTRAINT "GivenAnswer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sessionId" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ALTER COLUMN "answerOptionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "GivenAnswer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GivenAnswer_id_seq";

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "testId" SET DATA TYPE TEXT,
ALTER COLUMN "nextYesId" SET DATA TYPE TEXT,
ALTER COLUMN "nextNoId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Question_id_seq";

-- AlterTable
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Subscription_id_seq";

-- AlterTable
ALTER TABLE "Test" DROP CONSTRAINT "Test_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Test_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Test_id_seq";

-- AlterTable
ALTER TABLE "TestSession" DROP CONSTRAINT "TestSession_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "testId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TestSession_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "hashed_password" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GivenAnswer" ADD CONSTRAINT "GivenAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GivenAnswer" ADD CONSTRAINT "GivenAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GivenAnswer" ADD CONSTRAINT "GivenAnswer_answerOptionId_fkey" FOREIGN KEY ("answerOptionId") REFERENCES "AnswerOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
