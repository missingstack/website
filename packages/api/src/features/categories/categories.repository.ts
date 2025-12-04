import {
	type BaseCursorState,
	BasePaginatedRepository,
	CursorManager,
	FilterBuilder,
	QueryExecutor,
	type QueryStrategy,
	SortBuilder,
	type SortConfig,
	type SortFieldConfig,
} from "@missingstack/api/shared/pagination";
import type { Database } from "@missingstack/db";
import type { SQL } from "@missingstack/db/drizzle-orm";
import {
	asc,
	count,
	desc,
	eq,
	ilike,
	or,
	sql,
} from "@missingstack/db/drizzle-orm";
import { type Category, categories } from "@missingstack/db/schema/categories";
import { categoriesStacks } from "@missingstack/db/schema/categories-stacks";
import { toolsCategories } from "@missingstack/db/schema/tools-categories";
import type {
	CategoryCollection,
	CategoryQueryOptions,
	CreateCategoryInput,
	UpdateCategoryInput,
} from "./categories.schema";
import type {
	CategoryRepositoryInterface,
	CategoryWithCount,
} from "./categories.types";

type QueryableDb = Pick<
	Database,
	"select" | "transaction" | "insert" | "update" | "delete"
>;

type CategoryCursor = BaseCursorState & {
	name?: string;
	slug?: string;
	weight?: number;
};

type CategorySortBy = "name" | "slug" | "weight" | "createdAt";

class CategoryFilterBuilder extends FilterBuilder<CategoryQueryOptions> {
	protected buildSearchFilter(
		options: CategoryQueryOptions,
	): SQL<unknown> | null {
		const pattern = this.buildILikePattern(options.search);
		if (!pattern) return null;

		return (
			or(
				ilike(categories.name, pattern),
				ilike(categories.slug, pattern),
				ilike(categories.description, pattern),
			) ?? null
		);
	}

	protected buildEntityFilters(_options: CategoryQueryOptions): SQL<unknown>[] {
		// Categories don't have additional entity-specific filters
		return [];
	}
}

class CategorySortBuilder extends SortBuilder<
	typeof categories,
	CategoryCursor,
	CategorySortBy
> {
	protected readonly sortFields: Record<
		CategorySortBy,
		SortFieldConfig<typeof categories>
	> = {
		name: {
			field: categories.name,
			cursorKey: "name",
		},
		slug: {
			field: categories.slug,
			cursorKey: "slug",
		},
		weight: {
			field: categories.weight,
			cursorKey: "weight",
		},
		createdAt: {
			field: categories.createdAt,
			cursorKey: "createdAt",
		},
	} as const;

	protected readonly idField = categories.id;

	protected buildDefaultOrderBy(): SQL<unknown>[] {
		// Categories default to weight ASC, then name ASC, then id ASC
		return [asc(categories.weight), asc(categories.name), asc(categories.id)];
	}
}

class CategoryQueryExecutor extends QueryExecutor<
	Category,
	typeof categories,
	CategoryCursor,
	CategorySortBy
> {
	constructor(
		db: QueryableDb,
		private readonly sortBuilder: CategorySortBuilder,
	) {
		super(
			db,
			categories,
			new CursorManager<CategoryCursor>({
				secretKey: process.env.CURSOR_SIGNING_SECRET,
			}),
		);
	}

	protected async executeQuery(
		where: SQL<unknown>,
		orderBy: SQL<unknown>[],
		limit: number,
		_strategy: QueryStrategy,
	): Promise<Category[]> {
		return this.db
			.select()
			.from(categories)
			.where(where)
			.orderBy(...orderBy)
			.limit(limit);
	}

	protected buildCursorCondition(
		cursor: CategoryCursor,
		sortConfig: SortConfig<CategorySortBy>,
	): SQL<unknown> | null {
		return this.sortBuilder.buildCursorCondition(cursor, sortConfig);
	}

	protected buildOrderBy(
		sortConfig: SortConfig<CategorySortBy>,
	): SQL<unknown>[] {
		return this.sortBuilder.buildOrderBy(sortConfig);
	}

	protected createCursor(entity: Category, sortBy: string): string {
		return this.cursorManager.encode(
			{
				id: entity.id,
				createdAt: entity.createdAt,
				name: entity.name,
				slug: entity.slug,
				weight: entity.weight ?? undefined,
			},
			sortBy,
		);
	}
}

export class DrizzleCategoryRepository
	extends BasePaginatedRepository<
		Category,
		typeof categories,
		CategoryCursor,
		CategoryQueryOptions,
		CategorySortBy
	>
	implements CategoryRepositoryInterface
{
	protected readonly filterBuilder: CategoryFilterBuilder;
	protected readonly queryExecutor: CategoryQueryExecutor;
	private readonly sortBuilder: CategorySortBuilder;

	constructor(private readonly db: QueryableDb) {
		super();
		this.filterBuilder = new CategoryFilterBuilder();
		this.sortBuilder = new CategorySortBuilder();
		this.queryExecutor = new CategoryQueryExecutor(db, this.sortBuilder);
	}

	async getAll(
		options: CategoryQueryOptions = {},
	): Promise<CategoryCollection> {
		// Handle cursor validation failure with fallback
		const cursorValidation = this.queryExecutor.decodeCursor(
			options.cursor,
			options.sortBy,
		);

		if (options.cursor && !cursorValidation) {
			const result = await super.getAll({ ...options, cursor: null });
			return {
				items: result.items,
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		}

		const result = await super.getAll(options);
		return {
			items: result.items,
			nextCursor: result.nextCursor,
			hasMore: result.hasMore,
		};
	}

	protected buildSortConfig(
		options: CategoryQueryOptions,
	): SortConfig<CategorySortBy> {
		return {
			sortBy: options.sortBy ?? "weight",
			sortOrder: options.sortOrder ?? "asc",
		};
	}

	protected decodeCursor(
		cursor?: string | null,
		sortBy?: CategorySortBy,
	): CategoryCursor | null {
		return this.queryExecutor.decodeCursor(cursor, sortBy);
	}

	protected determineQueryStrategy(
		_options: CategoryQueryOptions,
	): QueryStrategy {
		return {
			needsJoin: false, // Categories don't need joins for search
		};
	}

	async getById(id: string): Promise<Category | null> {
		const [row] = await this.db
			.select()
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);

		return row ?? null;
	}

	async getBySlug(slug: string): Promise<Category | null> {
		const [row] = await this.db
			.select()
			.from(categories)
			.where(eq(categories.slug, slug))
			.limit(1);

		return row ?? null;
	}

	async getAllWithCounts(): Promise<CategoryWithCount[]> {
		// Efficient COUNT query using LEFT JOIN with indexed junction table
		const rows = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
				createdAt: categories.createdAt,
				updatedAt: categories.updatedAt,
				toolCount:
					sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`.as(
						"toolCount",
					),
			})
			.from(categories)
			.leftJoin(toolsCategories, eq(categories.id, toolsCategories.categoryId))
			.groupBy(categories.id)
			.orderBy(
				desc(sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`),
				asc(categories.name),
			);

		return rows.map((row) => ({
			...row,
			toolCount: Number(row.toolCount),
		}));
	}

	async getTopCategories(limit = 10): Promise<CategoryWithCount[]> {
		// Efficient COUNT query using LEFT JOIN with indexed junction table
		const rows = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
				createdAt: categories.createdAt,
				updatedAt: categories.updatedAt,
				toolCount:
					sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`.as(
						"toolCount",
					),
			})
			.from(categories)
			.leftJoin(toolsCategories, eq(categories.id, toolsCategories.categoryId))
			.groupBy(categories.id)
			.orderBy(
				desc(sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`),
				asc(categories.name),
			)
			.limit(limit);

		return rows.map((row) => ({
			...row,
			toolCount: Number(row.toolCount),
		}));
	}

	async create(input: CreateCategoryInput): Promise<Category> {
		const [category] = await this.db
			.insert(categories)
			.values({
				slug: input.slug,
				name: input.name,
				description: input.description || null,
				icon: input.icon,
				parentId: input.parentId || null,
				weight: input.weight ?? 0,
			})
			.returning();

		if (!category) {
			throw new Error("Failed to create category");
		}

		return category;
	}

	async update(id: string, input: UpdateCategoryInput): Promise<Category> {
		const updateData: Partial<typeof categories.$inferInsert> = {
			...(input.slug && { slug: input.slug }),
			...(input.name && { name: input.name }),
			...(input.description && {
				description: input.description || null,
			}),
			...(input.icon && { icon: input.icon }),
			...(input.parentId && {
				parentId: input.parentId || null,
			}),
			...(input.weight && { weight: input.weight }),
		};

		const [category] = await this.db
			.update(categories)
			.set(updateData)
			.where(eq(categories.id, id))
			.returning();

		if (!category) {
			throw new Error("Failed to update category");
		}

		return category;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(categories).where(eq(categories.id, id));
	}

	async getByStack(stackId: string): Promise<CategoryWithCount[]> {
		const rows = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
				createdAt: categories.createdAt,
				updatedAt: categories.updatedAt,
				toolCount:
					sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`.as(
						"toolCount",
					),
			})
			.from(categories)
			.innerJoin(
				categoriesStacks,
				eq(categories.id, categoriesStacks.categoryId),
			)
			.leftJoin(toolsCategories, eq(categories.id, toolsCategories.categoryId))
			.where(eq(categoriesStacks.stackId, stackId))
			.groupBy(categories.id)
			.orderBy(
				desc(sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`),
				asc(categories.name),
			);

		return rows.map((row) => ({
			...row,
			toolCount: Number(row.toolCount),
		}));
	}
}
