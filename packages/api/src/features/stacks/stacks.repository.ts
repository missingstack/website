import type { Database } from "@missingstack/db";
import { asc, count, desc, eq, sql } from "@missingstack/db/drizzle-orm";
import { type Stack, stacks } from "@missingstack/db/schema/stacks";
import { toolsStacks } from "@missingstack/db/schema/tools-stacks";
import type { CreateStackInput, UpdateStackInput } from "./stacks.schema";
import type { StackRepositoryInterface, StackWithCount } from "./stacks.types";

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

	async getAllWithCounts(): Promise<StackWithCount[]> {
		// Efficient COUNT query using LEFT JOIN with indexed junction table
		const rows = await this.db
			.select({
				id: stacks.id,
				slug: stacks.slug,
				name: stacks.name,
				description: stacks.description,
				icon: stacks.icon,
				parentId: stacks.parentId,
				weight: stacks.weight,
				createdAt: stacks.createdAt,
				updatedAt: stacks.updatedAt,
				toolCount: sql<number>`COALESCE(${count(toolsStacks.toolId)}, 0)`.as(
					"toolCount",
				),
			})
			.from(stacks)
			.leftJoin(toolsStacks, eq(stacks.id, toolsStacks.stackId))
			.groupBy(stacks.id)
			.orderBy(desc(sql`toolCount`), asc(stacks.name));

		return rows.map((row) => ({
			...row,
			toolCount: Number(row.toolCount),
		}));
	}

	async getTopStacks(limit = 10): Promise<StackWithCount[]> {
		// Efficient COUNT query using LEFT JOIN with indexed junction table
		const rows = await this.db
			.select({
				id: stacks.id,
				slug: stacks.slug,
				name: stacks.name,
				description: stacks.description,
				icon: stacks.icon,
				parentId: stacks.parentId,
				weight: stacks.weight,
				createdAt: stacks.createdAt,
				updatedAt: stacks.updatedAt,
				toolCount: sql<number>`COALESCE(${count(toolsStacks.toolId)}, 0)`.as(
					"toolCount",
				),
			})
			.from(stacks)
			.leftJoin(toolsStacks, eq(stacks.id, toolsStacks.stackId))
			.groupBy(stacks.id)
			.orderBy(desc(sql`toolCount`), asc(stacks.name))
			.limit(limit);

		return rows.map((row) => ({
			...row,
			toolCount: Number(row.toolCount),
		}));
	}

	async create(input: CreateStackInput): Promise<Stack> {
		const [stack] = await this.db
			.insert(stacks)
			.values({
				slug: input.slug,
				name: input.name,
				description: input.description || null,
				icon: input.icon || null,
				parentId: input.parentId || null,
				weight: input.weight ?? 0,
			})
			.returning();

		if (!stack) {
			throw new Error("Failed to create stack");
		}

		return stack;
	}

	async update(id: string, input: UpdateStackInput): Promise<Stack> {
		const updateData: Partial<typeof stacks.$inferInsert> = {
			...(input.slug && { slug: input.slug }),
			...(input.name && { name: input.name }),
			...(input.description && {
				description: input.description || null,
			}),
			...(input.icon && { icon: input.icon || null }),
			...(input.parentId && {
				parentId: input.parentId || null,
			}),
			...(input.weight && { weight: input.weight }),
		};

		const [stack] = await this.db
			.update(stacks)
			.set(updateData)
			.where(eq(stacks.id, id))
			.returning();

		if (!stack) {
			throw new Error("Failed to update stack");
		}

		return stack;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(stacks).where(eq(stacks.id, id));
	}
}
