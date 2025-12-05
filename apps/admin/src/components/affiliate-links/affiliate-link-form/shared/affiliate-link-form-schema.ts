import { z } from "zod";

export const affiliateLinkFormSchema = z.object({
	toolId: z.string().uuid("Please select a tool"),
	affiliateUrl: z.string().url("Please enter a valid URL").max(512),
	commissionRate: z.number().min(0).max(1),
	trackingCode: z.string().max(100).optional(),
	isPrimary: z.boolean(),
});

export type AffiliateLinkFormValues = z.infer<typeof affiliateLinkFormSchema>;

export const defaultAffiliateLinkFormValues: AffiliateLinkFormValues = {
	toolId: "",
	affiliateUrl: "",
	commissionRate: 0,
	trackingCode: "",
	isPrimary: false,
};
