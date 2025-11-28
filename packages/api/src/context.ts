import { db } from "@missingstack/db";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { createCategoryModule } from "./features/categories/categories.module";
import type { CategoriesServiceInterface } from "./features/categories/categories.types";
import { createSectionModule } from "./features/sections/sections.module";
import type { SectionsServiceInterface } from "./features/sections/sections.types";
import { createStatsModule } from "./features/stats/stats.module";
import type { StatsServiceInterface } from "./features/stats/stats.types";
import { createTagModule } from "./features/tags/tags.module";
import type { TagsServiceInterface } from "./features/tags/tags.types";
import { createToolModule } from "./features/tools/tools.module";
import type { ToolsServiceInterface } from "./features/tools/tools.types";

type CreateContextReq = FetchCreateContextFnOptions["req"];

const toolModule = createToolModule(db);
const categoryModule = createCategoryModule(db);
const tagModule = createTagModule(db);
const sectionModule = createSectionModule();
const statsModule = createStatsModule(db);

export type ServerDependencies = {
	toolsService: ToolsServiceInterface;
	categoriesService: CategoriesServiceInterface;
	tagsService: TagsServiceInterface;
	sectionsService: SectionsServiceInterface;
	statsService: StatsServiceInterface;
};

const dependencies: ServerDependencies = {
	toolsService: toolModule.toolsService,
	categoriesService: categoryModule.categoriesService,
	tagsService: tagModule.tagsService,
	sectionsService: sectionModule.sectionsService,
	statsService: statsModule.statsService,
};

export async function createContext(_req: CreateContextReq) {
	return { session: null, dependencies };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
