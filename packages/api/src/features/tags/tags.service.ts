import type { TagType } from "@missingstack/db/schema/enums";
import type { Tag } from "@missingstack/db/schema/tags";
import type { CreateTagInput, UpdateTagInput } from "./tags.schema";
import type {
	TagRepositoryInterface,
	TagWithCount,
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

	async getAllWithCounts(): Promise<TagWithCount[]> {
		return this.repository.getAllWithCounts();
	}

	async create(input: CreateTagInput): Promise<Tag> {
		return this.repository.create(input);
	}

	async update(id: string, input: UpdateTagInput): Promise<Tag> {
		return this.repository.update(id, input);
	}

	async delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}
}
