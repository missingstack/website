import type { Stack } from "@missingstack/db/schema/stacks";

export interface StackRepositoryInterface {
	getAll(): Promise<Stack[]>;
	getById(id: string): Promise<Stack | null>;
	getBySlug(slug: string): Promise<Stack | null>;
	getAllWithCounts(): Promise<Stack[]>;
	getTopStacks(limit?: number): Promise<Stack[]>;
}

export interface StacksServiceInterface {
	getAll(): Promise<Stack[]>;
	getById(id: string): Promise<Stack | null>;
	getBySlug(slug: string): Promise<Stack | null>;
	getAllWithCounts(): Promise<Stack[]>;
	getTopStacks(limit?: number): Promise<Stack[]>;
}
