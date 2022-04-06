/*
  Warnings:

  - You are about to drop the column `Institution` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `question_exam_submissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `question_exam_submissions` DROP FOREIGN KEY `question_exam_submissions_exam_id_fkey`;

-- DropForeignKey
ALTER TABLE `question_exam_submissions` DROP FOREIGN KEY `question_exam_submissions_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `question_exam_submissions` DROP FOREIGN KEY `question_exam_submissions_user_id_fkey`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `Institution`,
    ADD COLUMN `institution` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `question_exam_submissions`;

-- CreateTable
CREATE TABLE `question_submissions` (
    `exam_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `option` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `question_submissions_exam_id_question_id_user_id_option_key`(`exam_id`, `question_id`, `user_id`, `option`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_submissions` (
    `exam_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `exam_submissions_exam_id_key`(`exam_id`),
    UNIQUE INDEX `exam_submissions_exam_id_question_id_user_id_key`(`exam_id`, `question_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_options` (
    `question_id` INTEGER NOT NULL,
    `option` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `question_options_question_id_option_key`(`question_id`, `option`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `question_submissions` ADD CONSTRAINT `question_submissions_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_submissions` ADD CONSTRAINT `question_submissions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_submissions` ADD CONSTRAINT `exam_submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_submissions` ADD CONSTRAINT `exam_submissions_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_submissions` ADD CONSTRAINT `exam_submissions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_options` ADD CONSTRAINT `question_options_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
