import type { Database } from "@missingstack/db";
import { asc, desc, eq } from "@missingstack/db/drizzle-orm";
import { type Stack, stacks } from "@missingstack/db/schema/stacks";
import type { StackRepositoryInterface } from "./stacks.types";

export class DrizzleStackRepository implements StackRepositoryInterface {
	constructor(private readonly db: Database) {}

	async getAll(): Promise<Stack[]> {
		const rows = await this.db
			.select()
			.from(stacks)
			.orderBy(asc(stacks.weight), asc(stacks.name));

		return rows;
	}

	async getById(id: string): Promise<Stack | null> {
		const [row] = await this.db
			.select()
			.from(stacks)
			.where(eq(stacks.id, id))
			.limit(1);

		return row ?? null;
	}

	async getBySlug(slug: string): Promise<Stack | null> {
		const [row] = await this.db
			.select()
			.from(stacks)
			.where(eq(stacks.slug, slug))
			.limit(1);

		return row ?? null;
	}

	async getAllWithCounts(): Promise<Stack[]> {
		const rows = await this.db
			.select()
			.from(stacks)
			.orderBy(desc(stacks.toolCount), asc(stacks.name));

		return rows;
	}

	async getTopStacks(limit = 10): Promise<Stack[]> {
		const rows = await this.db
			.select()
			.from(stacks)
			.orderBy(desc(stacks.toolCount), asc(stacks.name))
			.limit(limit);

		return rows;
	}
}
