/*
  Warnings:

  - You are about to drop the column `hashed_password` on the `User` table. All the data in the column will be lost.
  - Made the column `isCorrect` on table `AnswerOption` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'DOCTOR');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'BASIC');

-- AlterTable
ALTER TABLE "AnswerOption" ALTER COLUMN "isCorrect" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashed_password",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'PATIENT',
ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "consultationsIncluded" INTEGER NOT NULL DEFAULT 0,
    "consultationsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
