-- --------------------------------------------------------
-- Gazdagép:                     127.0.0.1
-- Szerver verzió:               11.8.2-MariaDB - mariadb.org binary distribution
-- Szerver OS:                   Win64
-- HeidiSQL Verzió:              12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Adatbázis struktúra mentése a etr.
CREATE DATABASE IF NOT EXISTS `etr` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `etr`;

-- Struktúra mentése tábla etr. classes
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_name` varchar(20) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `class_teacher_id` int(11) DEFAULT NULL,
  `room_number` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `class_teacher_id` (`class_teacher_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`class_teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tábla adatainak mentése etr.classes: ~5 rows (hozzávetőleg)
INSERT IGNORE INTO `classes` (`id`, `class_name`, `academic_year`, `created_at`, `class_teacher_id`, `room_number`) VALUES
	(1, '9.A', '2024/2025', '2026-01-18 12:48:02', NULL, '101'),
	(2, '10.B', '2024/2025', '2026-01-18 12:48:02', NULL, '202'),
	(3, '11.C', '2024/2025', '2026-01-18 12:48:02', NULL, '303'),
	(4, '13.A', '2024/2025', '2026-01-18 13:17:30', 45, '101'),
	(5, '10.A', '2024/2025', '2026-01-26 17:13:41', NULL, '100');

-- Struktúra mentése tábla etr. grades
CREATE TABLE IF NOT EXISTS `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `grade_value` decimal(3,1) NOT NULL,
  `grade_type` enum('dolgozat','felelet','házi','projekt') NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `grade_date` date NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `is_final` tinyint(1) DEFAULT 0,
  `weight` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `student_id` (`student_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tábla adatainak mentése etr.grades: ~27 rows (hozzávetőleg)
INSERT IGNORE INTO `grades` (`id`, `student_id`, `subject_id`, `teacher_id`, `grade_value`, `grade_type`, `description`, `grade_date`, `created_at`, `is_final`, `weight`) VALUES
	(57, 56, 6, 45, 5.0, 'felelet', 'dasdas', '2026-02-14', '2026-02-14 14:35:59', 0, 1),
	(58, 56, 6, 45, 1.0, 'felelet', 'dasdas', '2026-02-14', '2026-02-14 14:36:45', 0, 2),
	(59, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:48', 0, 1),
	(60, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:49', 0, 1),
	(61, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:51', 0, 1),
	(62, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:52', 0, 1),
	(63, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:52', 0, 1),
	(64, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:53', 0, 1),
	(65, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:54', 0, 1),
	(66, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:55', 0, 1),
	(67, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:57', 0, 1),
	(68, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:58', 0, 1),
	(69, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:38:58', 0, 1),
	(70, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-14', '2026-02-14 14:50:36', 0, 1),
	(71, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 11:17:05', 0, 3),
	(72, 56, 6, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 11:17:06', 0, 3),
	(74, 56, 2, 45, 5.0, 'dolgozat', 'Másik', '2026-02-15', '2026-02-15 11:19:23', 0, 2),
	(75, 56, 1, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 12:34:18', 0, 1),
	(76, 56, 1, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 12:34:19', 0, 1),
	(77, 56, 1, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 12:34:20', 0, 1),
	(78, 56, 1, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 12:34:22', 0, 1),
	(79, 56, 1, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 12:34:23', 0, 1),
	(80, 56, 1, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 12:34:24', 0, 1),
	(81, 56, 1, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 12:34:25', 0, 1),
	(82, 56, 1, 45, 4.0, 'felelet', NULL, '2026-02-15', '2026-02-15 12:51:36', 0, 1),
	(83, 56, 3, 45, 5.0, 'felelet', NULL, '2026-02-15', '2026-02-15 12:51:44', 0, 1),
	(84, 56, 2, 45, 5.0, 'projekt', 'Másik', '2026-02-15', '2026-02-15 12:57:51', 0, 3);

-- Struktúra mentése tábla etr. homework
CREATE TABLE IF NOT EXISTS `homework` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `homework_teacher_id_idx` (`teacher_id`),
  KEY `homework_class_id_idx` (`class_id`),
  KEY `fk_homework_subject` (`subject_id`),
  CONSTRAINT `fk_homework_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `homework_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `homework_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tábla adatainak mentése etr.homework: ~6 rows (hozzávetőleg)
INSERT IGNORE INTO `homework` (`id`, `teacher_id`, `class_id`, `subject_id`, `title`, `description`, `due_date`, `created_at`) VALUES
	(8, 45, 4, NULL, 'dasd', 'dsadsad', '2026-02-19', NULL),
	(9, 45, NULL, NULL, 'dsads', 'dsaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '2026-02-26', NULL),
	(10, 45, NULL, NULL, 'dsad', 'dsa', '2026-02-20', NULL),
	(11, 45, 4, 2, 'dsadas', 'dasdasd', '2026-02-27', NULL),
	(12, 45, 4, 1, 'dsazjzffjzh', 'fztfzjzjhjzh', '2026-02-05', NULL),
	(13, 45, 4, 1, 'dsadas', 'dsadas', '2026-02-26', NULL);

-- Struktúra mentése tábla etr. homework_submissions
CREATE TABLE IF NOT EXISTS `homework_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `homework_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `status` enum('pending','submitted','accepted','rejected') DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `homework_submissions_homework_id_idx` (`homework_id`),
  KEY `homework_submissions_student_id_idx` (`student_id`),
  CONSTRAINT `homework_submissions_homework_id_fkey` FOREIGN KEY (`homework_id`) REFERENCES `homework` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `homework_submissions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tábla adatainak mentése etr.homework_submissions: ~3 rows (hozzávetőleg)
INSERT IGNORE INTO `homework_submissions` (`id`, `homework_id`, `student_id`, `status`, `submitted_at`, `reviewed_at`) VALUES
	(13, 11, 56, 'submitted', '2026-02-15 11:55:18', NULL),
	(14, 12, 56, 'submitted', '2026-02-15 11:55:24', NULL),
	(15, 13, 56, 'pending', NULL, NULL);

-- Struktúra mentése tábla etr. messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_receiver` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tábla adatainak mentése etr.messages: ~3 rows (hozzávetőleg)
INSERT IGNORE INTO `messages` (`id`, `sender_id`, `receiver_id`, `title`, `content`, `is_read`, `created_at`) VALUES
	(30, 56, 45, 'sdd', 'dssd', 0, '2026-02-14 14:34:40'),
	(31, 56, 45, 'sasdasd', 'dsadas', 0, '2026-02-15 11:17:57'),
	(32, 56, 45, 'dasdas', 'dasdasdadas', 0, '2026-02-15 12:33:06');

-- Struktúra mentése tábla etr. student_classes
CREATE TABLE IF NOT EXISTS `student_classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `enrollment_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_classes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tábla adatainak mentése etr.student_classes: ~1 rows (hozzávetőleg)
INSERT IGNORE INTO `student_classes` (`id`, `student_id`, `class_id`, `enrollment_date`, `is_active`) VALUES
	(16, 56, 4, '2026-02-12', 1);

-- Struktúra mentése tábla etr. subjects
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(10) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `credits` int(11) DEFAULT 1,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subject_code` (`subject_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tábla adatainak mentése etr.subjects: ~6 rows (hozzávetőleg)
INSERT IGNORE INTO `subjects` (`id`, `subject_code`, `subject_name`, `is_active`, `created_at`, `credits`, `description`) VALUES
	(1, 'MAT', 'Matematika', 1, '2026-01-18 12:48:02', 5, 'Matematika tantárgy'),
	(2, 'FIZ', 'Fizika', 1, '2026-01-18 12:48:02', 4, 'Fizika tantárgy'),
	(3, 'KEM', 'Kémia', 1, '2026-01-18 12:48:02', 3, 'Kémia tantárgy'),
	(4, 'TOR', 'Történelem', 1, '2026-01-18 12:48:02', 3, 'Történelem tantárgy'),
	(5, 'IRO', 'Irodalom', 1, '2026-01-18 12:48:02', 4, 'Magyar irodalom'),
	(6, 'ANG', 'Angol nyelv', 1, '2026-01-18 12:48:02', 4, 'Angol nyelv és irodalom');

-- Struktúra mentése tábla etr. teacher_subjects
CREATE TABLE IF NOT EXISTS `teacher_subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `teacher_subjects_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_subjects_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tábla adatainak mentése etr.teacher_subjects: ~4 rows (hozzávetőleg)
INSERT IGNORE INTO `teacher_subjects` (`id`, `teacher_id`, `subject_id`, `class_id`, `academic_year`, `created_at`) VALUES
	(10, 45, 6, 4, '2024/2025', '2026-02-12 15:05:38'),
	(11, 45, 2, 4, '2024/2025', '2026-02-15 11:18:50'),
	(12, 45, 1, 4, '2024/2025', '2026-02-15 11:19:01'),
	(13, 45, 3, 4, '2024/2025', '2026-02-15 11:27:21');

-- Struktúra mentése tábla etr. users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `role` enum('admin','teacher','student') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `date_of_birth` date DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Tábla adatainak mentése etr.users: ~4 rows (hozzávetőleg)
INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `is_active`, `created_at`, `date_of_birth`, `last_login`, `phone`, `profile_image`) VALUES
	(24, 'admin', 'admin@ganz.hu', '$2b$10$L/7PGi26pBpXk/cQ4qkZi.ec/p1Tt97Ua5OdKDG0bPv/H2dsg1XQq', 'Antal', 'Rogán', 'admin', 1, '2026-01-18 12:49:35', NULL, NULL, NULL, NULL),
	(33, 'anti', 'delet77181@cnguopin.com', '$2b$10$d4lpp0Lze05FVU7txfvVBOTnaMBMtlP4B.QMi8RT6GMIkXhgQ5O6y', 'asd', 'ad', 'admin', 1, '2026-01-26 16:57:41', NULL, NULL, NULL, NULL),
	(45, 'tanar', 'mevehon533@boxmach.com', '$2b$10$mpAbYfqQ55DQmUNKyfZYiuOpyyhqPtVoMuJ8fJLZrwWbCMpogh/Vq', 'Tanár', 'Tanár', 'teacher', 1, '2026-02-12 14:41:12', NULL, NULL, NULL, NULL),
	(56, 'diak', 'diak@ganz.hu', '$2b$10$w2aK/jDByD02yyL0z6rEcuyt.B7tByscBOGfwgcm6gVZ7uHI.9eQi', 'diak', 'diak', 'student', 1, '2026-02-12 15:05:10', NULL, NULL, NULL, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
