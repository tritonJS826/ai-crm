-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('RADIO', 'CHECKBOX', 'TEXT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "nextYesId" TEXT,
    "nextNoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GivenAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerOptionId" TEXT,
    "freeText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GivenAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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
