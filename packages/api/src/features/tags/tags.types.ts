import type { TagType } from "@missingstack/db/schema/enums";
import type { Tag } from "@missingstack/db/schema/tags";

export interface TagRepositoryInterface {
	getAll(): Promise<Tag[]>;
	getById(id: string): Promise<Tag | null>;
	getBySlug(slug: string): Promise<Tag | null>;
	getByType(type: TagType): Promise<Tag[]>;
}

export interface TagsServiceInterface {
	getAll(): Promise<Tag[]>;
	getById(id: string): Promise<Tag | null>;
	getBySlug(slug: string): Promise<Tag | null>;
	getByType(type: TagType): Promise<Tag[]>;
}
