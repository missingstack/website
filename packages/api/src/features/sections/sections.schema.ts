import {
	iconColorEnum,
	sectionFilterEnum,
	sectionLayoutEnum,
	sectionTypeEnum,
} from "@missingstack/db/schema/enums";
import { z } from "zod";

const sectionTypeEnumValues = sectionTypeEnum.enumValues;
const sectionFilterEnumValues = sectionFilterEnum.enumValues;
const sectionLayoutEnumValues = sectionLayoutEnum.enumValues;
const iconColorEnumValues = iconColorEnum.enumValues;

export const sectionSchema = z.object({
	id: z.string(),
	type: z.enum(sectionTypeEnumValues),
	filter: z.enum(sectionFilterEnumValues).nullable(),
	categoryId: z.string().nullable(),
	title: z.string(),
	description: z.string().nullable(),
	icon: z.string(),
	iconColor: z.enum(iconColorEnumValues).nullable(),
	limit: z.number().int().nullable(),
	layout: z.enum(sectionLayoutEnumValues).nullable(),
	enabled: z.boolean().nullable(),
	weight: z.number().int().nullable(),
});

export const sectionsListSchema = z.array(sectionSchema);

export type Section = z.infer<typeof sectionSchema>;
