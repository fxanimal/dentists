CREATE TABLE `appointments` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`patient_id` varchar(36) NOT NULL,
	`appointment_time` timestamp NOT NULL,
	`status` enum('pending','confirmed','cancelled','finished') NOT NULL DEFAULT 'pending',
	`reason` text,
	`phone_number` varchar(20),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`),
	CONSTRAINT `patient_id_idx` UNIQUE(`patient_id`)
);
--> statement-breakpoint
CREATE TABLE `clinic_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinic_name` text NOT NULL DEFAULT ('Canuck Dentist'),
	`working_days` text NOT NULL DEFAULT ('1,2,3,4,5'),
	`working_hours_start` varchar(5) NOT NULL DEFAULT '09:30',
	`working_hours_end` varchar(5) NOT NULL DEFAULT '17:30',
	`slot_duration_minutes` int NOT NULL DEFAULT 60,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinic_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dentists` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`full_name` text NOT NULL,
	`specialization` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dentists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`full_name` text NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `time_slots` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`slot_date_time` timestamp NOT NULL,
	`dentist_id` varchar(36) NOT NULL,
	`is_booked` boolean NOT NULL DEFAULT false,
	`appointment_id` varchar(36),
	CONSTRAINT `time_slots_id` PRIMARY KEY(`id`),
	CONSTRAINT `slot_date_time_dentist_idx` UNIQUE(`slot_date_time`,`dentist_id`)
);
