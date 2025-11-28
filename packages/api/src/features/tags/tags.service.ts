import type { TagType } from "@missingstack/db/schema/enums";
import type { Tag } from "@missingstack/db/schema/tags";
import type {
	TagRepositoryInterface,
	TagsServiceInterface,
} from "./tags.types";

export class TagsService implements TagsServiceInterface {
	constructor(private readonly repository: TagRepositoryInterface) {}

	async getAll(): Promise<Tag[]> {
		return this.repository.getAll();
	}

	async getById(id: string): Promise<Tag | null> {
		return this.repository.getById(id);
	}

	async getBySlug(slug: string): Promise<Tag | null> {
		return this.repository.getBySlug(slug);
	}

	async getByType(type: TagType): Promise<Tag[]> {
		return this.repository.getByType(type);
	}
}
