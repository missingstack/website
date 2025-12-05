import {
	LICENSE_OPTIONS,
	PRICING_OPTIONS,
} from "@missingstack/api/constants/enums";
import { z } from "zod";

const pricingOptions = PRICING_OPTIONS;
const licenseOptions = LICENSE_OPTIONS;

export const toolFormSchema = z.object({
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(120, "Slug must be 120 characters or less"),
	name: z
		.string()
		.min(1, "Name is required")
		.max(160, "Name must be 160 characters or less"),
	tagline: z
		.string()
		.max(256, "Tagline must be 256 characters or less")
		.optional(),
	description: z.string().min(1, "Description is required"),
	logo: z
		.string()
		.min(1, "Logo URL is required")
		.max(256, "Logo URL must be 256 characters or less"),
	website: z
		.string()
		.url("Must be a valid URL")
		.max(256, "Website URL must be 256 characters or less")
		.optional()
		.or(z.literal("")),
	pricing: z.enum(pricingOptions as [string, ...string[]]),
	license: z.enum(licenseOptions as [string, ...string[]]).optional(),
	featured: z.boolean(),
	categoryIds: z.array(z.string()),
	stackIds: z.array(z.string()),
	tagIds: z.array(z.string()),
	alternativeIds: z.array(z.string()),
});

export type ToolFormValues = z.infer<typeof toolFormSchema>;

export const defaultToolFormValues: ToolFormValues = {
	slug: "",
	name: "",
	tagline: "",
	description: "",
	logo: "",
	website: "",
	pricing: "free",
	license: undefined,
	featured: false,
	categoryIds: [],
	stackIds: [],
	tagIds: [],
	alternativeIds: [],
};
