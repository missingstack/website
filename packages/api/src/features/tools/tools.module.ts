import type { Database } from "@missingstack/db";
import { DrizzleToolRepository } from "./tools.repository";
import { ToolsService } from "./tools.service";
import type { ToolsServiceInterface } from "./tools.types";

export function createToolService(database: Database): ToolsServiceInterface {
	const repository = new DrizzleToolRepository(database);
	return new ToolsService(repository);
}
