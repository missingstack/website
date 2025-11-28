import type { Database } from "@missingstack/db";
import { asc, eq } from "@missingstack/db/drizzle-orm";
import type { TagType } from "@missingstack/db/schema/enums";
import { tags } from "@missingstack/db/schema/tags";

import type { TagData, TagRepositoryInterface } from "./tags.types";

type QueryableDb = Pick<Database, "select">;

export class DrizzleTagRepository implements TagRepositoryInterface {
	constructor(private readonly db: QueryableDb) {}

	async getAll(): Promise<TagData[]> {
		const rows = await this.db
			.select({
				id: tags.id,
				slug: tags.slug,
				name: tags.name,
				type: tags.type,
				color: tags.color,
			})
			.from(tags)
			.orderBy(asc(tags.name));

		return rows;
	}

	async getById(id: string): Promise<TagData | null> {
		const [row] = await this.db
			.select({
				id: tags.id,
				slug: tags.slug,
				name: tags.name,
				type: tags.type,
				color: tags.color,
			})
			.from(tags)
			.where(eq(tags.id, id))
			.limit(1);

		return row ?? null;
	}

	async getBySlug(slug: string): Promise<TagData | null> {
		const [row] = await this.db
			.select({
				id: tags.id,
				slug: tags.slug,
				name: tags.name,
				type: tags.type,
				color: tags.color,
			})
			.from(tags)
			.where(eq(tags.slug, slug))
			.limit(1);

		return row ?? null;
	}

	async getByType(type: TagType): Promise<TagData[]> {
		const rows = await this.db
			.select({
				id: tags.id,
				slug: tags.slug,
				name: tags.name,
				type: tags.type,
				color: tags.color,
			})
			.from(tags)
			.where(eq(tags.type, type))
			.orderBy(asc(tags.name));

		return rows;
	}
}
