CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"paste_id" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"paste_id" text NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"parent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pastes" (
	"id" text PRIMARY KEY NOT NULL,
	"url_id" varchar(12) NOT NULL,
	"content" text NOT NULL,
	"format" varchar(20) DEFAULT 'plaintext' NOT NULL,
	"password_hash" varchar(255),
	"burn_after_read" boolean DEFAULT false NOT NULL,
	"open_discussion" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "pastes_url_id_unique" UNIQUE("url_id")
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_paste_id_pastes_id_fk" FOREIGN KEY ("paste_id") REFERENCES "public"."pastes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_paste_id_pastes_id_fk" FOREIGN KEY ("paste_id") REFERENCES "public"."pastes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_paste_id_idx" ON "attachments" USING btree ("paste_id");--> statement-breakpoint
CREATE INDEX "comments_paste_id_idx" ON "comments" USING btree ("paste_id");--> statement-breakpoint
CREATE INDEX "comments_parent_id_idx" ON "comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "pastes_url_id_idx" ON "pastes" USING btree ("url_id");--> statement-breakpoint
CREATE INDEX "pastes_expires_at_idx" ON "pastes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "pastes_created_at_idx" ON "pastes" USING btree ("created_at");