CREATE TABLE `concept_edges` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`from_concept_id` text NOT NULL,
	`to_concept_id` text NOT NULL,
	`strength` text DEFAULT 'hard' NOT NULL,
	`reason` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_concept_id`) REFERENCES `concepts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_concept_id`) REFERENCES `concepts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `concept_edges_pair_idx` ON `concept_edges` (`from_concept_id`,`to_concept_id`);--> statement-breakpoint
CREATE INDEX `concept_edges_course_idx` ON `concept_edges` (`course_id`);--> statement-breakpoint
CREATE INDEX `concept_edges_to_idx` ON `concept_edges` (`to_concept_id`);--> statement-breakpoint
CREATE TABLE `concepts` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`module` text,
	`position` integer DEFAULT 0 NOT NULL,
	`difficulty` integer,
	`bloom_level` text,
	`learning_objective` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `concepts_course_idx` ON `concepts` (`course_id`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`department_id` text NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`level` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_department_code_idx` ON `courses` (`department_id`,`code`);--> statement-breakpoint
CREATE INDEX `courses_department_idx` ON `courses` (`department_id`);