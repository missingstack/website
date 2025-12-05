import { z } from "zod";

export const sponsorshipFormSchema = z
	.object({
		toolId: z.string().uuid("Please select a tool"),
		tier: z.enum(["basic", "premium", "enterprise"]),
		startDate: z.date({ message: "Start date is required" }),
		endDate: z.date({ message: "End date is required" }),
		isActive: z.boolean(),
		priorityWeight: z.number().int().min(0),
		paymentStatus: z.enum(["pending", "completed", "failed", "refunded"]),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.endDate > data.startDate;
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		},
	);

export type SponsorshipFormValues = z.infer<typeof sponsorshipFormSchema>;

export const defaultSponsorshipFormValues: SponsorshipFormValues = {
	toolId: "",
	tier: "basic",
	startDate: undefined as unknown as Date,
	endDate: undefined as unknown as Date,
	isActive: true,
	priorityWeight: 0,
	paymentStatus: "pending",
};
