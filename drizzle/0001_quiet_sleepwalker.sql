CREATE TABLE `place_moderation` (
	`place_id` text PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`customer_key` text NOT NULL,
	`plan_id` text NOT NULL,
	`amount` integer NOT NULL,
	`months` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_key` text,
	`created_at` integer NOT NULL,
	`paid_at` integer,
	`access_until` integer,
	`cancel_requested_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_payment_orders_user_status` ON `payment_orders` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `place_quality` (
	`place_id` text PRIMARY KEY NOT NULL,
	`paused` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trials` (
	`user_id` text PRIMARY KEY NOT NULL,
	`started_at` integer NOT NULL
);
