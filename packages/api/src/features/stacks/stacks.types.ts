import type { Stack } from "@missingstack/db/schema/stacks";
import type { CreateStackInput } from "./stacks.schema";

// Stack with computed tool count
export type StackWithCount = Stack & {
	toolCount: number;
};

export interface StackRepositoryInterface {
	getAll(): Promise<Stack[]>;
	getById(id: string): Promise<Stack | null>;
	getBySlug(slug: string): Promise<Stack | null>;
	getAllWithCounts(): Promise<StackWithCount[]>;
	getTopStacks(limit?: number): Promise<StackWithCount[]>;
	create(input: CreateStackInput): Promise<Stack>;
	delete(id: string): Promise<void>;
}

export interface StacksServiceInterface {
	getAll(): Promise<Stack[]>;
	getById(id: string): Promise<Stack | null>;
	getBySlug(slug: string): Promise<Stack | null>;
	getAllWithCounts(): Promise<StackWithCount[]>;
	getTopStacks(limit?: number): Promise<StackWithCount[]>;
	create(input: CreateStackInput): Promise<Stack>;
	delete(id: string): Promise<void>;
}
