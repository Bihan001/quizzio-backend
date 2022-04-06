/*
  Warnings:

  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrivateExamEmail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionUserAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Exam` DROP FOREIGN KEY `Exam_creator_id_fkey`;

-- DropForeignKey
ALTER TABLE `ExamParticipant` DROP FOREIGN KEY `ExamParticipant_exam_id_fkey`;

-- DropForeignKey
ALTER TABLE `ExamParticipant` DROP FOREIGN KEY `ExamParticipant_participant_id_fkey`;

-- DropForeignKey
ALTER TABLE `ExamQuestion` DROP FOREIGN KEY `ExamQuestion_exam_id_fkey`;

-- DropForeignKey
ALTER TABLE `ExamQuestion` DROP FOREIGN KEY `ExamQuestion_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `ExamTag` DROP FOREIGN KEY `ExamTag_exam_id_fkey`;

-- DropForeignKey
ALTER TABLE `ExamTag` DROP FOREIGN KEY `ExamTag_tag_id_fkey`;

-- DropForeignKey
ALTER TABLE `PrivateExamEmail` DROP FOREIGN KEY `PrivateExamEmail_examId_fkey`;

-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_variant_id_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionUserAnswer` DROP FOREIGN KEY `QuestionUserAnswer_exam_id_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionUserAnswer` DROP FOREIGN KEY `QuestionUserAnswer_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionUserAnswer` DROP FOREIGN KEY `QuestionUserAnswer_user_id_fkey`;

-- DropTable
DROP TABLE `Exam`;

-- DropTable
DROP TABLE `ExamParticipant`;

-- DropTable
DROP TABLE `ExamQuestion`;

-- DropTable
DROP TABLE `ExamTag`;

-- DropTable
DROP TABLE `PrivateExamEmail`;

-- DropTable
DROP TABLE `Question`;

-- DropTable
DROP TABLE `QuestionUserAnswer`;

-- DropTable
DROP TABLE `QuestionVariant`;

-- DropTable
DROP TABLE `Tag`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191) NULL,
    `dob` DATETIME(3) NOT NULL,
    `address` VARCHAR(255) NULL,
    `country` VARCHAR(191) NULL,
    `profile_image` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `latest_degree` VARCHAR(191) NULL,
    `Institution` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `country_code` INTEGER NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `banner` VARCHAR(191) NULL,
    `thumbnail` VARCHAR(191) NULL,
    `start_time` DATETIME(3) NOT NULL,
    `duration` BIGINT NOT NULL,
    `ongoing` BOOLEAN NOT NULL DEFAULT false,
    `is_private` BOOLEAN NOT NULL DEFAULT false,
    `participant_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_participants` (
    `exam_id` INTEGER NOT NULL,
    `participant_id` INTEGER NOT NULL,
    `score` INTEGER NULL,
    `finish_time` INTEGER NULL,
    `rank` INTEGER NULL,

    UNIQUE INDEX `exam_participants_exam_id_participant_id_key`(`exam_id`, `participant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `private_exam_emails` (
    `examId` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `private_exam_emails_examId_email_key`(`examId`, `email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tag` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tags_tag_key`(`tag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_tags` (
    `exam_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    UNIQUE INDEX `exam_tags_exam_id_tag_id_key`(`exam_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(191) NOT NULL,
    `variant_id` INTEGER NOT NULL,
    `solution` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_questions` (
    `exam_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `mark` INTEGER NOT NULL,
    `negative_mark` INTEGER NOT NULL,

    UNIQUE INDEX `exam_questions_exam_id_question_id_key`(`exam_id`, `question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `variant` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `question_variants_variant_key`(`variant`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_exam_submissions` (
    `exam_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `submission` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `question_exam_submissions_exam_id_question_id_user_id_key`(`exam_id`, `question_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_participants` ADD CONSTRAINT `exam_participants_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_participants` ADD CONSTRAINT `exam_participants_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `private_exam_emails` ADD CONSTRAINT `private_exam_emails_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_tags` ADD CONSTRAINT `exam_tags_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_tags` ADD CONSTRAINT `exam_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `question_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_questions` ADD CONSTRAINT `exam_questions_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_questions` ADD CONSTRAINT `exam_questions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_exam_submissions` ADD CONSTRAINT `question_exam_submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_exam_submissions` ADD CONSTRAINT `question_exam_submissions_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_exam_submissions` ADD CONSTRAINT `question_exam_submissions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
