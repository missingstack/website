import type { EntityWith } from "@missingstack/api/shared";
import type { Stack } from "@missingstack/db/schema/stacks";
import type { CreateStackInput, UpdateStackInput } from "./stacks.schema";
// Convenience type alias for Stack extensions
export type StackWith<P = Record<string, unknown>> = EntityWith<Stack, P>;
export type StackWithCount = StackWith<{
	toolCount: number;
}>;

export interface StackRepositoryInterface {
	getAll(): Promise<Stack[]>;
	getById(id: string): Promise<Stack | null>;
	getBySlug(slug: string): Promise<Stack | null>;
	getAllWithCounts(): Promise<StackWithCount[]>;
	getTopStacks(limit?: number): Promise<StackWithCount[]>;
	create(input: CreateStackInput): Promise<Stack>;
	update(id: string, input: UpdateStackInput): Promise<Stack>;
	delete(id: string): Promise<void>;
}

export interface StacksServiceInterface {
	getAll(): Promise<Stack[]>;
	getById(id: string): Promise<Stack | null>;
	getBySlug(slug: string): Promise<Stack | null>;
	getAllWithCounts(): Promise<StackWithCount[]>;
	getTopStacks(limit?: number): Promise<StackWithCount[]>;
	create(input: CreateStackInput): Promise<Stack>;
	update(id: string, input: UpdateStackInput): Promise<Stack>;
	delete(id: string): Promise<void>;
}
