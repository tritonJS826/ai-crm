/*
  Warnings:

  - A unique constraint covering the columns `[platform,remote_message_id]` on the table `messages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `direction` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "messages"
    ADD COLUMN "direction" "MessageDirection";

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

-- Backfill existing rows
UPDATE "messages"
SET "direction" = (CASE
                      WHEN "from_user_id" IS NULL THEN 'IN'
                      ELSE 'OUT'
    END
)::"MessageDirection";
-- Enforce NOT NULL after backfill
ALTER TABLE "messages"
    ALTER COLUMN "direction" SET NOT NULL;

