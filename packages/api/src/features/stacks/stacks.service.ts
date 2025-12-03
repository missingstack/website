import type { Stack } from "@missingstack/db/schema/stacks";
import type { CreateStackInput, UpdateStackInput } from "./stacks.schema";
import type {
	StackRepositoryInterface,
	StackWithCount,
	StacksServiceInterface,
} from "./stacks.types";

export class StacksService implements StacksServiceInterface {
	constructor(private readonly repository: StackRepositoryInterface) {}

	async getAll(): Promise<Stack[]> {
		return this.repository.getAll();
	}

	async getById(id: string): Promise<Stack | null> {
		return this.repository.getById(id);
	}

	async getBySlug(slug: string): Promise<Stack | null> {
		return this.repository.getBySlug(slug);
	}

	async getAllWithCounts(): Promise<StackWithCount[]> {
		return this.repository.getAllWithCounts();
	}

	async getTopStacks(limit?: number): Promise<StackWithCount[]> {
		return this.repository.getTopStacks(limit);
	}

	async create(input: CreateStackInput): Promise<Stack> {
		return this.repository.create(input);
	}

	async update(id: string, input: UpdateStackInput): Promise<Stack> {
		return this.repository.update(id, input);
	}

	async delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}
}
