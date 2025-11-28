import type { Database } from "@missingstack/db";
import { DrizzleToolRepository } from "./tools.repository";
import { ToolsService } from "./tools.service";
import type { ToolsServiceInterface } from "./tools.types";

export type ToolModule = {
	toolsService: ToolsServiceInterface;
};

export function createToolModule(database: Database): ToolModule {
	const repository = new DrizzleToolRepository(database);
	const toolsService = new ToolsService(repository);

	return {
		toolsService,
	};
}
