import type { TagType } from "@missingstack/db/schema/enums";
import type { Tag } from "@missingstack/db/schema/tags";
import type { CreateTagInput } from "./tags.schema";

// Tag with computed tool count
export type TagWithCount = Tag & {
	toolCount: number;
};

export interface TagRepositoryInterface {
	getAll(): Promise<Tag[]>;
	getById(id: string): Promise<Tag | null>;
	getBySlug(slug: string): Promise<Tag | null>;
	getByType(type: TagType): Promise<Tag[]>;
	getAllWithCounts(): Promise<TagWithCount[]>;
	create(input: CreateTagInput): Promise<Tag>;
}

export interface TagsServiceInterface {
	getAll(): Promise<Tag[]>;
	getById(id: string): Promise<Tag | null>;
	getBySlug(slug: string): Promise<Tag | null>;
	getByType(type: TagType): Promise<Tag[]>;
	getAllWithCounts(): Promise<TagWithCount[]>;
	create(input: CreateTagInput): Promise<Tag>;
}
