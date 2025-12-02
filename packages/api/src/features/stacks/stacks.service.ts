import type { Stack } from "@missingstack/db/schema/stacks";
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
}
