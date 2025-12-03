import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
	email: z.string().email("Invalid email address"),
	first_name: z.string().optional(),
	last_name: z.string().optional(),
});

export type SubscribeNewsletterInput = z.infer<
	typeof subscribeNewsletterSchema
>;
