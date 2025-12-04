import type { EntityWith } from "@missingstack/api/shared";
import type { TagType } from "@missingstack/db/schema/enums";
import type { Tag } from "@missingstack/db/schema/tags";
import type { CreateTagInput, UpdateTagInput } from "./tags.schema";
// Convenience type alias for Tag extensions
export type TagWith<P = Record<string, unknown>> = EntityWith<Tag, P>;
export type TagWithCount = TagWith<{
	toolCount: number;
}>;

export interface TagRepositoryInterface {
	getAll(): Promise<Tag[]>;
	getById(id: string): Promise<Tag | null>;
	getBySlug(slug: string): Promise<Tag | null>;
	getByType(type: TagType): Promise<Tag[]>;
	getAllWithCounts(): Promise<TagWithCount[]>;
	create(input: CreateTagInput): Promise<Tag>;
	update(id: string, input: UpdateTagInput): Promise<Tag>;
	delete(id: string): Promise<void>;
}

export interface TagsServiceInterface {
	getAll(): Promise<Tag[]>;
	getById(id: string): Promise<Tag | null>;
	getBySlug(slug: string): Promise<Tag | null>;
	getByType(type: TagType): Promise<Tag[]>;
	getAllWithCounts(): Promise<TagWithCount[]>;
	create(input: CreateTagInput): Promise<Tag>;
	update(id: string, input: UpdateTagInput): Promise<Tag>;
	delete(id: string): Promise<void>;
}
