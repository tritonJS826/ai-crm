/*
  Warnings:

  - Added the required column `hashed_password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hashed_password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT,
    "body" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);
