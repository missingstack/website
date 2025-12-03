import { badgeVariantEnum, tagTypeEnum } from "@missingstack/db/schema/enums";
import { z } from "zod";

const tagTypeEnumValues = tagTypeEnum.enumValues;
const badgeVariantEnumValues = badgeVariantEnum.enumValues;

// Create tag request schema
export const createTagSchema = z
	.object({
		slug: z.string().min(1),
		name: z.string().min(1),
		type: z.enum(tagTypeEnumValues),
		color: z.enum(badgeVariantEnumValues).default("default"),
	})
	.strict();

export type CreateTagInput = z.infer<typeof createTagSchema>;

// Update tag request schema (same as create, all fields optional)
export const updateTagSchema = createTagSchema.partial();

export type UpdateTagInput = z.infer<typeof updateTagSchema>;
