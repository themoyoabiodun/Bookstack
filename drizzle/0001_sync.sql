ALTER TABLE `books` ADD `updated_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `books` ADD `dirty` integer DEFAULT true NOT NULL;