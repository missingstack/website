import { services } from "@missingstack/api/context";
import type { Elysia } from "elysia";
import { t } from "elysia";

export * from "./stacks.module";
export * from "./stacks.repository";
export * from "./stacks.service";
export type { StackWithCount } from "./stacks.types";
export * from "./stacks.types";

import { createStackSchema } from "./stacks.schema";

export function createStacksRouter(app: Elysia) {
	return app.group("/stacks", (app) =>
		app
			.post(
				"/",
				async ({ body }) => {
					const result = createStackSchema.safeParse(body);
					if (!result.success) {
						throw new Error(
							`Invalid stack data: ${result.error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					return services.stackService.create(result.data);
				},
				{
					body: t.Object({
						slug: t.String(),
						name: t.String(),
						description: t.Optional(t.String()),
						icon: t.Optional(t.String()),
						parentId: t.Optional(t.String()),
						weight: t.Optional(t.Number()),
					}),
				},
			)
			.get("/", async () => {
				return services.stackService.getAll();
			})
			.get(
				"/:id",
				async ({ params: { id } }) => {
					return services.stackService.getById(id);
				},
				{
					params: t.Object({ id: t.String() }),
				},
			)
			.get(
				"/slug/:slug",
				async ({ params: { slug } }) => {
					return services.stackService.getBySlug(slug);
				},
				{
					params: t.Object({ slug: t.String() }),
				},
			)
			.get("/with-counts", async () => {
				return services.stackService.getAllWithCounts();
			})
			.get(
				"/top",
				async ({ query }) => {
					const limit = query?.limit
						? Number.parseInt(query.limit, 10)
						: undefined;
					return services.stackService.getTopStacks(limit);
				},
				{
					query: t.Optional(t.Object({ limit: t.Optional(t.String()) })),
				},
			),
	);
}
