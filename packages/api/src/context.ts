import { db } from "@missingstack/db";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { createToolModule } from "./features/tools/tools.module";
import type { ToolsServiceInterface } from "./features/tools/tools.types";

type CreateContextReq = FetchCreateContextFnOptions["req"];

const toolModule = createToolModule(db);

export type ServerDependencies = {
	toolsService: ToolsServiceInterface;
};

const dependencies: ServerDependencies = {
	toolsService: toolModule.toolsService,
};

export async function createContext(_req: CreateContextReq) {
	return { session: null, dependencies };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
