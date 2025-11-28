import type { Database } from "@missingstack/db";
import { DrizzleTagRepository } from "./tags.repository";
import { TagsService } from "./tags.service";
import type { TagsServiceInterface } from "./tags.types";

export type TagModule = {
	tagsService: TagsServiceInterface;
};

export function createTagModule(database: Database): TagModule {
	const repository = new DrizzleTagRepository(database);
	const tagsService = new TagsService(repository);

	return {
		tagsService,
	};
}
