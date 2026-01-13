/*
  Warnings:

  - A unique constraint covering the columns `[platform,remote_message_id]` on the table `messages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `direction` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "messages"
    ADD COLUMN "direction" "MessageDirection" NOT NULL;

-- CreateIndex
CREATE INDEX "contacts_phone_idx" ON "contacts" ("phone");

-- CreateIndex
CREATE INDEX "messages_direction_idx" ON "messages" ("direction");

-- CreateIndex
CREATE INDEX "messages_from_user_id_idx" ON "messages" ("from_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_platform_remote_message_id_key" ON "messages" ("platform", "remote_message_id");

-- CreateIndex
CREATE INDEX "orders_conversation_id_idx" ON "orders" ("conversation_id");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

