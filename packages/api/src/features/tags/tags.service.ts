import type { TagType } from "@missingstack/db/schema/enums";
import type {
	TagData,
	TagRepositoryInterface,
	TagsServiceInterface,
} from "./tags.types";

export class TagsService implements TagsServiceInterface {
	constructor(private readonly repository: TagRepositoryInterface) {}

	async getAll(): Promise<TagData[]> {
		return this.repository.getAll();
	}

	async getById(id: string): Promise<TagData | null> {
		return this.repository.getById(id);
	}

	async getBySlug(slug: string): Promise<TagData | null> {
		return this.repository.getBySlug(slug);
	}

	async getByType(type: TagType): Promise<TagData[]> {
		return this.repository.getByType(type);
	}
}
