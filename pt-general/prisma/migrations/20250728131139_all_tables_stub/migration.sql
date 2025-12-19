/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'GUIDE', 'ADMIN');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'EXPERIENCED', 'PRO');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'WAITING_LIST');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'PAYPAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'VIDEO', 'ROUTE', 'TIPS');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "profilePicUrl" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CLIENT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Guide" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "experience" TEXT,
    "specializations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "program" JSONB NOT NULL,
    "guideId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourDate" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "participants" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourMaterial" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoDiary" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "photos" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoDiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProcessedPhoto" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rawUrl" TEXT NOT NULL,
    "processedUrl" TEXT,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProcessedPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TourCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TourCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TourTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TourTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guide_userId_key" ON "Guide"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "_TourCategories_B_index" ON "_TourCategories"("B");

-- CreateIndex
CREATE INDEX "_TourTags_B_index" ON "_TourTags"("B");

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourDate" ADD CONSTRAINT "TourDate_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourMaterial" ADD CONSTRAINT "TourMaterial_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoDiary" ADD CONSTRAINT "PhotoDiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProcessedPhoto" ADD CONSTRAINT "UserProcessedPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TourCategories" ADD CONSTRAINT "_TourCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TourCategories" ADD CONSTRAINT "_TourCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TourTags" ADD CONSTRAINT "_TourTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TourTags" ADD CONSTRAINT "_TourTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
