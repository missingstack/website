import {
	BADGE_VARIANT_OPTIONS,
	TAG_TYPE_OPTIONS,
} from "@missingstack/api/constants/enums";
import { z } from "zod";

const tagTypeOptions = TAG_TYPE_OPTIONS;
const badgeVariantOptions = BADGE_VARIANT_OPTIONS;

export const tagFormSchema = z.object({
	slug: z.string().min(1, "Slug is required"),
	name: z.string().min(1, "Name is required"),
	type: z.enum(tagTypeOptions as [string, ...string[]]),
	color: z.enum(badgeVariantOptions as [string, ...string[]]).optional(),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;

export const defaultTagFormValues: TagFormValues = {
	slug: "",
	name: "",
	type: "feature",
	color: "default",
};
