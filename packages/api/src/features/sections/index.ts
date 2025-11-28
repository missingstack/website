import { services } from "@missingstack/api/context";
import type { Elysia } from "elysia";
import { t } from "elysia";

export type {
	Section,
	SectionRepositoryInterface,
	SectionsServiceInterface,
} from "./sections.types";

export function createSectionsRouter(app: Elysia) {
	return app.group("/sections", (app) =>
		app
			.get("/", async () => {
				return services.sectionService.getAll();
			})
			.get(
				"/:id",
				async ({ params: { id } }) => {
					return services.sectionService.getById(id);
				},
				{
					params: t.Object({ id: t.String() }),
				},
			)
			.get("/enabled", async () => {
				return services.sectionService.getEnabled();
			}),
	);
}
