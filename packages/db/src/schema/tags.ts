/**
 * Tags Schema
 *
 * Tags provide additional classification for tools.
 * Different tag types help organize tags by purpose.
 */

import { index, pgTable, text } from "drizzle-orm/pg-core";
import { timestampFields, uuidPrimaryKey } from "./base";
import { badgeVariantEnum, tagTypeEnum } from "./enums";

// Tags table
export const tags = pgTable(
	"tags",
	{
		...uuidPrimaryKey,
		slug: text("slug").notNull().unique(),
		name: text("name").notNull(),
		type: tagTypeEnum("type").notNull(),
		color: badgeVariantEnum("color").default("default"),
		...timestampFields,
	},
	(table) => [
		index("tags_slug_idx").on(table.slug),
		index("tags_type_idx").on(table.type),
	],
);

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
