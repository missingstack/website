import type { Database } from "@missingstack/db";
import { DrizzleStackRepository } from "./stacks.repository";
import { StacksService } from "./stacks.service";
import type { StacksServiceInterface } from "./stacks.types";

export function createStackService(database: Database): StacksServiceInterface {
	const repository = new DrizzleStackRepository(database);
	return new StacksService(repository);
}
