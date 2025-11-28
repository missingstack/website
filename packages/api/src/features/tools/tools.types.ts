import type { Tool } from "@missingstack/db/schema/tools";
import type {
	ToolCollection as ToolCollectionSchema,
	ToolQueryOptions as ToolQueryOptionsSchema,
} from "./tools.schema";

export type ToolCollection = ToolCollectionSchema;
export type ToolQueryOptions = ToolQueryOptionsSchema;

export type ToolEntity = Pick<
	Tool,
	| "id"
	| "slug"
	| "name"
	| "tagline"
	| "description"
	| "logo"
	| "website"
	| "pricing"
	| "featured"
	| "createdAt"
	| "updatedAt"
>;

export interface ToolRepositoryInterface {
	getAllTools(options: ToolQueryOptions): Promise<ToolCollection>;
}

export interface ToolsServiceInterface {
	getAllTools(options?: ToolQueryOptions): Promise<ToolCollection>;
}
