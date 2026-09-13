CREATE TABLE `owner` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`user_id` text NOT NULL,
	`place_id` text NOT NULL,
	`satisfied` integer NOT NULL,
	`noise` text NOT NULL,
	`crowd` text NOT NULL,
	`comfort` text NOT NULL,
	`day` text NOT NULL,
	`time` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `place_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_place_updated` ON `reviews` (`place_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `saved` (
	`user_id` text NOT NULL,
	`place_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `place_id`)
);
--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`city` text NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`source` text NOT NULL,
	`note` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`decided_at` integer,
	`decided_by` text,
	`reason` text
);
--> statement-breakpoint
CREATE INDEX `idx_suggestions_status` ON `suggestions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_suggestions_user` ON `suggestions` (`user_id`);