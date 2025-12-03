import { services } from "@missingstack/api/context";
import type { Elysia } from "elysia";
import { t } from "elysia";

import { subscribeNewsletterSchema } from "./newsletter.schema";

export type { NewsletterServiceInterface } from "./newsletter.types";

export function createNewsletterRouter(app: Elysia) {
	return app.group("/newsletter", (app) =>
		app.post(
			"/",
			async ({ body }) => {
				const result = subscribeNewsletterSchema.safeParse(body);
				if (!result.success)
					throw new Error(
						`Invalid subscribe data: ${result.error.issues.map((e) => e.message).join(", ")}`,
					);

				return services.newsletterService.subscribe({
					email: result.data.email,
					firstName: result.data.first_name,
					lastName: result.data.last_name,
					unsubscribed: false,
				});
			},
			{
				body: t.Object({
					email: t.String(),
					first_name: t.Optional(t.String()),
					last_name: t.Optional(t.String()),
				}),
			},
		),
	);
}
