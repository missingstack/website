DROP INDEX "tools_sponsorship_priority_idx";--> statement-breakpoint
DROP INDEX "tools_is_sponsored_idx";--> statement-breakpoint
DROP INDEX "tools_featured_sponsored_idx";--> statement-breakpoint
DROP INDEX "tools_monetization_enabled_idx";--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "affiliate_url";--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "sponsorship_priority";--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "is_sponsored";--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "monetization_enabled";