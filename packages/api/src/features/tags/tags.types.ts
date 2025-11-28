import type { TagType } from "@missingstack/db/schema/enums";
import type { Tag } from "@missingstack/db/schema/tags";

export type TagData = Pick<Tag, "id" | "slug" | "name" | "type" | "color">;

export interface TagRepositoryInterface {
	getAll(): Promise<TagData[]>;
	getById(id: string): Promise<TagData | null>;
	getBySlug(slug: string): Promise<TagData | null>;
	getByType(type: TagType): Promise<TagData[]>;
}

export interface TagsServiceInterface {
	getAll(): Promise<TagData[]>;
	getById(id: string): Promise<TagData | null>;
	getBySlug(slug: string): Promise<TagData | null>;
	getByType(type: TagType): Promise<TagData[]>;
}
