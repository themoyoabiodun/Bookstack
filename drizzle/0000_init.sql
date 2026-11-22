CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text DEFAULT '' NOT NULL,
	`cover_url` text,
	`page_count` integer,
	`pages_read` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'reading' NOT NULL,
	`open_library_key` text,
	`isbn` text,
	`started_at` integer,
	`finished_at` integer,
	`created_at` integer NOT NULL
);
