import { services } from "@missingstack/api/context";
import type { Elysia } from "elysia";
import { t } from "elysia";

export type { Category } from "@missingstack/db/schema/categories";
export type {
	CategoriesServiceInterface,
	CategoryRepositoryInterface,
} from "./categories.types";

export function createCategoriesRouter(app: Elysia) {
	return app.group("/categories", (app) =>
		app
			.get("/", async () => {
				return services.categoryService.getAll();
			})
			.get(
				"/:id",
				async ({ params: { id } }) => {
					return services.categoryService.getById(id);
				},
				{
					params: t.Object({ id: t.String() }),
				},
			)
			.get(
				"/slug/:slug",
				async ({ params: { slug } }) => {
					return services.categoryService.getBySlug(slug);
				},
				{
					params: t.Object({ slug: t.String() }),
				},
			)
			.get("/with-counts", async () => {
				return services.categoryService.getAllWithCounts();
			})
			.get(
				"/top",
				async ({ query }) => {
					const limit = query?.limit
						? Number.parseInt(query.limit, 10)
						: undefined;
					return services.categoryService.getTopCategories(limit);
				},
				{
					query: t.Optional(t.Object({ limit: t.Optional(t.String()) })),
				},
			),
	);
}
