import { services } from "@missingstack/api/context";
import { tagTypeEnum } from "@missingstack/db/schema/enums";
import type { Elysia } from "elysia";
import { t } from "elysia";

export type { Tag } from "@missingstack/db/schema/tags";
export type {
	TagRepositoryInterface,
	TagsServiceInterface,
} from "./tags.types";

const tagTypeEnumValues = tagTypeEnum.enumValues;

export function createTagsRouter(app: Elysia) {
	return app.group("/tags", (app) =>
		app
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
			),
	);
}
