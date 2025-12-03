import type { Database } from "@missingstack/db";
import { asc, count, desc, eq, sql } from "@missingstack/db/drizzle-orm";
import type { TagType } from "@missingstack/db/schema/enums";
import { type Tag, tags } from "@missingstack/db/schema/tags";
import { toolsTags } from "@missingstack/db/schema/tools-tags";
import type { CreateTagInput } from "./tags.schema";
import type { TagRepositoryInterface, TagWithCount } from "./tags.types";

type QueryableDb = Pick<Database, "select" | "insert">;

export class DrizzleTagRepository implements TagRepositoryInterface {
	constructor(private readonly db: QueryableDb) {}

	async getAll(): Promise<Tag[]> {
		const rows = await this.db.select().from(tags).orderBy(asc(tags.name));

		return rows;
	}

	async getById(id: string): Promise<Tag | null> {
		const [row] = await this.db
			.select()
			.from(tags)
			.where(eq(tags.id, id))
			.limit(1);

		return row ?? null;
	}

	async getBySlug(slug: string): Promise<Tag | null> {
		const [row] = await this.db
			.select()
			.from(tags)
			.where(eq(tags.slug, slug))
			.limit(1);

		return row ?? null;
	}

	async getByType(type: TagType): Promise<Tag[]> {
		const rows = await this.db
			.select()
			.from(tags)
			.where(eq(tags.type, type))
			.orderBy(asc(tags.name));

		return rows;
	}

	async getAllWithCounts(): Promise<TagWithCount[]> {
		// Efficient COUNT query using LEFT JOIN with indexed junction table
		const rows = await this.db
			.select({
				id: tags.id,
				slug: tags.slug,
				name: tags.name,
				type: tags.type,
				color: tags.color,
				createdAt: tags.createdAt,
				updatedAt: tags.updatedAt,
				toolCount: sql<number>`COALESCE(${count(toolsTags.tagId)}, 0)`.as(
					"toolCount",
				),
			})
			.from(tags)
			.leftJoin(toolsTags, eq(tags.id, toolsTags.tagId))
			.groupBy(tags.id)
			.orderBy(desc(sql`toolCount`), asc(tags.name));

		return rows.map((row) => ({
			...row,
			toolCount: Number(row.toolCount),
		}));
	}

	async create(input: CreateTagInput): Promise<Tag> {
		const [tag] = await this.db
			.insert(tags)
			.values({
				slug: input.slug,
				name: input.name,
				type: input.type,
				color: input.color ?? "default",
			})
			.returning();

		if (!tag) {
			throw new Error("Failed to create tag");
		}

		return tag;
	}
}
