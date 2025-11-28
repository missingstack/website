import type { Database } from "@missingstack/db";
import { DrizzleTagRepository } from "./tags.repository";
import { TagsService } from "./tags.service";
import type { TagsServiceInterface } from "./tags.types";

export function createTagService(database: Database): TagsServiceInterface {
	const repository = new DrizzleTagRepository(database);
	return new TagsService(repository);
}
