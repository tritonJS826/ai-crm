-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "remote_message_id" TEXT NOT NULL,
    "text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_remote_message_id_key" ON "messages"("remote_message_id");
