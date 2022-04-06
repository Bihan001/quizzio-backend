/*
  Warnings:

  - You are about to drop the column `created_at` on the `ExamParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `ExamParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ExamTag` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `ExamTag` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `PrivateExamEmail` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `PrivateExamEmail` table. All the data in the column will be lost.
  - The primary key for the `QuestionUserAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `QuestionUserAnswer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[exam_id,question_id,user_id]` on the table `QuestionUserAnswer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `QuestionVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ExamParticipant` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`;

-- AlterTable
ALTER TABLE `ExamTag` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`;

-- AlterTable
ALTER TABLE `PrivateExamEmail` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`;

-- AlterTable
ALTER TABLE `Question` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `QuestionUserAnswer` DROP PRIMARY KEY,
    DROP COLUMN `id`;

-- AlterTable
ALTER TABLE `QuestionVariant` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `QuestionUserAnswer_exam_id_question_id_user_id_key` ON `QuestionUserAnswer`(`exam_id`, `question_id`, `user_id`);
