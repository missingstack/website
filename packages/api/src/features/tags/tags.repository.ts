import type { Database } from "@missingstack/db";
import { asc, eq } from "@missingstack/db/drizzle-orm";
import type { TagType } from "@missingstack/db/schema/enums";
import { type Tag, tags } from "@missingstack/db/schema/tags";

import type { TagRepositoryInterface } from "./tags.types";

type QueryableDb = Pick<Database, "select">;

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
}
