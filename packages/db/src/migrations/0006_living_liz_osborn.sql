DROP TYPE "public"."platform";--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('web', 'mac', 'windows', 'linux', 'ios', 'android', 'extension', 'api');--> statement-breakpoint
ALTER TABLE "tools" ALTER COLUMN "pricing" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."pricing_model";--> statement-breakpoint
CREATE TYPE "public"."pricing_model" AS ENUM('free', 'freemium', 'paid', 'open-source', 'enterprise');--> statement-breakpoint
ALTER TABLE "tools" ALTER COLUMN "pricing" SET DATA TYPE "public"."pricing_model" USING "pricing"::"public"."pricing_model";