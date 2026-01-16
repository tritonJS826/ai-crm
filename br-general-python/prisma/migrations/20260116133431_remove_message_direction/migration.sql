/*
  Warnings:

  - You are about to drop the column `direction` on the `messages` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "messages_direction_idx";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "direction";

-- DropEnum
DROP TYPE "MessageDirection";
