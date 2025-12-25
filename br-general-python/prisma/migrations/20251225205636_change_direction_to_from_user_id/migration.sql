/*
  Warnings:

  - You are about to drop the column `direction` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "direction",
ADD COLUMN     "from_user_id" TEXT;

-- DropEnum
DROP TYPE "MessageDirection";
