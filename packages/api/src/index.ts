import { openapi } from "@elysiajs/openapi";
import { services } from "@missingstack/api/context";
import { createCategoriesRouter } from "@missingstack/api/features/categories";
import { createNewsletterRouter } from "@missingstack/api/features/newsletter";
import { createSectionsRouter } from "@missingstack/api/features/sections";
import { createSponsorshipsRouter } from "@missingstack/api/features/sponsorships";
import { createStacksRouter } from "@missingstack/api/features/stacks";
import { createStatsRouter } from "@missingstack/api/features/stats";
import { createTagsRouter } from "@missingstack/api/features/tags";
import { createToolsRouter } from "@missingstack/api/features/tools";
import { Elysia } from "elysia";

import type { ServiceInterface } from "./context";

export function createApp(dependencies: ServiceInterface) {
	return new Elysia({ prefix: "/api/v1" })
		.state("dependencies", dependencies)
		.derive(({ store }) => ({
			dependencies: store.dependencies as ServiceInterface,
		}));
}

export const app = createApp(services)
	.use(openapi())
	.get("/health", () => "OK")
	.use(createToolsRouter)
	.use(createCategoriesRouter)
	.use(createTagsRouter)
	.use(createStacksRouter)
	.use(createSectionsRouter)
	.use(createStatsRouter)
	.use(createNewsletterRouter)
	.use(createSponsorshipsRouter);

export type app = typeof app;
