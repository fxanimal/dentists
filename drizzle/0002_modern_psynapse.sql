ALTER TABLE `clinic_settings` MODIFY COLUMN `clinic_name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `clinic_settings` MODIFY COLUMN `working_days` text NOT NULL;--> statement-breakpoint
ALTER TABLE `clinic_settings` MODIFY COLUMN `working_hours_start` varchar(5) NOT NULL;--> statement-breakpoint
ALTER TABLE `clinic_settings` MODIFY COLUMN `working_hours_end` varchar(5) NOT NULL;--> statement-breakpoint
ALTER TABLE `clinic_settings` MODIFY COLUMN `slot_duration_minutes` int NOT NULL;