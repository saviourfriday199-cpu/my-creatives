CREATE TABLE `extraction_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`source_text` text NOT NULL,
	`status` text DEFAULT 'proposed' NOT NULL,
	`model` text NOT NULL,
	`proposal` text NOT NULL,
	`error` text,
	`created_by_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `extraction_runs_course_idx` ON `extraction_runs` (`course_id`);