import { services } from "@missingstack/api/context";
import { tagTypeEnum } from "@missingstack/db/schema/enums";
import type { Elysia } from "elysia";
import { t } from "elysia";

export type { Tag } from "@missingstack/db/schema/tags";
export type {
	TagRepositoryInterface,
	TagWithCount,
	TagsServiceInterface,
} from "./tags.types";

import { createTagSchema } from "./tags.schema";

const tagTypeEnumValues = tagTypeEnum.enumValues;

export function createTagsRouter(app: Elysia) {
	return app.group("/tags", (app) =>
		app
			.post(
				"/",
				async ({ body }) => {
					const result = createTagSchema.safeParse(body);
					if (!result.success) {
						throw new Error(
							`Invalid tag data: ${result.error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					return services.tagService.create(result.data);
				},
				{
					body: t.Object({
						slug: t.String(),
						name: t.String(),
						type: t.String(),
						color: t.Optional(t.String()),
					}),
				},
			)
			.get("/", async () => {
				return services.tagService.getAll();
			})
			.get(
				"/:id",
				async ({ params: { id } }) => {
					return services.tagService.getById(id);
				},
				{
					params: t.Object({ id: t.String() }),
				},
			)
			.get(
				"/slug/:slug",
				async ({ params: { slug } }) => {
					return services.tagService.getBySlug(slug);
				},
				{
					params: t.Object({ slug: t.String() }),
				},
			)
			.get(
				"/type/:type",
				async ({ params: { type } }) => {
					if (
						!tagTypeEnumValues.includes(
							type as (typeof tagTypeEnumValues)[number],
						)
					) {
						throw new Error(`Invalid tag type: ${type}`);
					}

					return services.tagService.getByType(
						type as (typeof tagTypeEnumValues)[number],
					);
				},
				{
					params: t.Object({ type: t.String() }),
				},
			)
			.get("/with-counts", async () => {
				return services.tagService.getAllWithCounts();
			}),
	);
}
