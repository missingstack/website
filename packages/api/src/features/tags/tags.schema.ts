import { tagTypeEnum } from "@missingstack/db/schema/enums";
import { z } from "zod";

const tagTypeEnumValues = tagTypeEnum.enumValues;

export const tagSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	type: z.enum(tagTypeEnumValues),
	color: z.string().nullable(),
});

export const tagsListSchema = z.array(tagSchema);

export const getTagsByTypeSchema = z.object({
	type: z.enum(tagTypeEnumValues),
});

export type Tag = z.infer<typeof tagSchema>;
