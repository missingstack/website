/**
 * Database Seed Script
 *
 * Bootstraps the Supabase database with initial data from JSON/YAML files.
 * Run with: bun run scripts/seed.ts
 */

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { db } from "../src";
import {
	categories,
	tags,
	tools,
	toolsCategories,
	toolsTags,
} from "../src/schema";
import type { BadgeVariant, PricingModel, TagType } from "../src/schema/enums";

// Validate environment - use process.env directly for scripts
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error("❌ DATABASE_URL environment variable is required");
	process.exit(1);
}

// Data Loading Helpers
interface ToolJson {
	id: string;
	slug: string;
	name: string;
	tagline: string;
	description: string;
	logo: string;
	website?: string;
	categoryIds: string[]; // Actually contains slugs, not IDs
	tagIds: string[]; // Actually contains slugs, not IDs
	pricing: string;
	featured?: boolean;
	createdAt: string;
	updatedAt: string;
}

function loadToolsFromJson(): ToolJson[] {
	const toolsPath = path.join(process.cwd(), "scripts/tools.json");

	try {
		const content = fs.readFileSync(toolsPath, "utf-8");
		return JSON.parse(content) as ToolJson[];
	} catch {
		console.warn("⚠️  No tools.json found, skipping tools");
		return [];
	}
}

// Pricing mapping (normalize different formats)
const pricingMap: Record<string, PricingModel> = {
	free: "Free",
	freemium: "Freemium",
	"free & paid": "Freemium",
	paid: "Paid",
	"open-source": "Open Source",
	enterprise: "Enterprise",
};

// Seed Functions
async function seedCategories(): Promise<Map<string, string>> {
	console.log("📁 Seeding categories...");

	const categoriesPath = path.join(process.cwd(), "scripts/categories.json");
	const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));
	const slugToIdMap = new Map<string, string>();

	// First pass: generate UUIDs for all categories
	for (const cat of categoriesData) {
		const categoryId = randomUUID();
		slugToIdMap.set(cat.slug, categoryId);
	}

	// Second pass: insert categories with resolved parent relationships
	for (const cat of categoriesData) {
		const categoryId = slugToIdMap.get(cat.slug);
		if (!categoryId) continue;

		// Resolve parentId: if cat.parentId is a slug, look it up; if it's already a UUID, use it
		let parentId: string | null = null;
		if (cat.parentId) {
			// Check if parentId is a slug (look it up) or already a UUID
			parentId = slugToIdMap.get(cat.parentId) || cat.parentId || null;
		}

		await db
			.insert(categories)
			.values({
				id: categoryId,
				slug: cat.slug,
				name: cat.name,
				description: cat.description,
				icon: cat.icon,
				parentId,
				weight: cat.weight ?? 0,
				// createdAt and updatedAt will use defaults from timestampFields if not provided
			})
			.onConflictDoUpdate({
				target: categories.slug, // Use slug for conflict detection
				set: {
					name: cat.name,
					description: cat.description,
					icon: cat.icon,
					parentId,
					weight: cat.weight ?? 0,
					updatedAt: new Date(),
				},
			});
	}

	// Query database to get actual IDs (important for onConflictDoUpdate which keeps existing IDs)
	const actualCategories = await db
		.select({ id: categories.id, slug: categories.slug })
		.from(categories);

	const actualSlugToIdMap = new Map<string, string>();
	for (const cat of actualCategories) {
		actualSlugToIdMap.set(cat.slug, cat.id);
	}

	console.log(`   ✅ Seeded ${categoriesData.length} categories`);
	return actualSlugToIdMap;
}

async function seedTags(): Promise<Map<string, string>> {
	console.log("🏷️  Seeding tags...");

	const tagsPath = path.join(process.cwd(), "scripts/tags.json");
	const tagsData = JSON.parse(fs.readFileSync(tagsPath, "utf-8"));
	const slugToIdMap = new Map<string, string>();

	for (const tag of tagsData) {
		const tagId = randomUUID();
		slugToIdMap.set(tag.slug, tagId);

		await db
			.insert(tags)
			.values({
				id: tagId,
				slug: tag.slug,
				name: tag.name,
				type: tag.type as TagType,
				color: (tag.color || "default") as BadgeVariant,
				// createdAt and updatedAt will use defaults from timestampFields if not provided
			})
			.onConflictDoUpdate({
				target: tags.slug, // Use slug for conflict detection
				set: {
					name: tag.name,
					type: tag.type as TagType,
					color: (tag.color || "default") as BadgeVariant,
					updatedAt: new Date(),
				},
			});
	}

	// Query database to get actual IDs (important for onConflictDoUpdate which keeps existing IDs)
	const actualTags = await db
		.select({ id: tags.id, slug: tags.slug })
		.from(tags);

	const actualSlugToIdMap = new Map<string, string>();
	for (const tag of actualTags) {
		actualSlugToIdMap.set(tag.slug, tag.id);
	}

	console.log(`   ✅ Seeded ${tagsData.length} tags`);
	return actualSlugToIdMap;
}

async function seedTools(
	categorySlugToId: Map<string, string>,
	tagSlugToId: Map<string, string>,
) {
	console.log("🔧 Seeding tools...");

	const yamlTools = loadToolsFromJson();
	const toolSlugToId = new Map<string, string>();

	// First pass: generate UUIDs for all tools
	for (const tool of yamlTools) {
		const toolId = randomUUID();
		toolSlugToId.set(tool.slug, toolId);
	}

	// Second pass: insert tools and relationships
	for (const tool of yamlTools) {
		// Map pricing to valid enum value
		const pricing = pricingMap[tool.pricing?.toLowerCase()] || "Freemium";
		const toolId = toolSlugToId.get(tool.slug);
		if (!toolId) {
			console.warn(`   ⚠️  Tool ID not found for slug ${tool.slug}`);
			continue;
		}

		// Insert/update tool
		await db
			.insert(tools)
			.values({
				id: toolId,
				slug: tool.slug,
				name: tool.name,
				tagline: tool.tagline,
				description: tool.description,
				logo: tool.logo,
				website: tool.website,
				pricing,
				featured: tool.featured ?? false,
				// Preserve timestamps from JSON if provided, otherwise defaults from timestampFields will be used
				...(tool.createdAt && { createdAt: new Date(tool.createdAt) }),
				...(tool.updatedAt || tool.createdAt
					? { updatedAt: new Date(tool.updatedAt || tool.createdAt) }
					: {}),
			})
			.onConflictDoUpdate({
				target: tools.slug, // Use slug for conflict detection
				set: {
					name: tool.name,
					tagline: tool.tagline,
					description: tool.description,
					logo: tool.logo,
					website: tool.website,
					pricing,
					featured: tool.featured ?? false,
					updatedAt: new Date(),
				},
			});

		// Seed tool categories (delete existing first to handle removals)
		await db.delete(toolsCategories).where(eq(toolsCategories.toolId, toolId));

		for (const categorySlug of tool.categoryIds || []) {
			// Look up category ID by slug
			const categoryId = categorySlugToId.get(categorySlug);
			if (!categoryId) {
				console.warn(
					`   ⚠️  Category "${categorySlug}" not found for tool ${tool.slug}`,
				);
				continue;
			}

			try {
				await db
					.insert(toolsCategories)
					.values({
						toolId,
						categoryId,
					})
					.onConflictDoNothing();
			} catch (error) {
				console.warn(
					`   ⚠️  Failed to link category "${categorySlug}" to tool ${tool.slug}: ${error}`,
				);
			}
		}

		// Seed tool tags
		await db.delete(toolsTags).where(eq(toolsTags.toolId, toolId));

		for (const tagSlug of tool.tagIds || []) {
			// Look up tag ID by slug
			const tagId = tagSlugToId.get(tagSlug);
			if (!tagId) {
				console.warn(`   ⚠️  Tag "${tagSlug}" not found for tool ${tool.slug}`);
				continue;
			}

			try {
				await db
					.insert(toolsTags)
					.values({
						toolId,
						tagId,
					})
					.onConflictDoNothing();
			} catch (error) {
				console.warn(
					`   ⚠️  Failed to link tag "${tagSlug}" to tool ${tool.slug}: ${error}`,
				);
			}
		}
	}

	console.log(`   ✅ Seeded ${yamlTools.length} tools`);
}

async function recalculateToolCounts() {
	console.log("📊 Recalculating category tool counts...");

	// Update all category tool counts in a single query
	await db.execute(sql`
    UPDATE categories c
    SET tool_count = COALESCE((
      SELECT COUNT(*)::int 
      FROM tools_categories tc 
      WHERE tc.category_id = c.id
    ), 0)
  `);

	console.log("   ✅ Tool counts recalculated");
}

async function main() {
	console.log("🚀 Starting database seed...\n");

	try {
		// Seed in order (categories and tags first, then tools that reference them)
		// Get slug-to-ID mappings for junction tables
		const categorySlugToId = await seedCategories();
		const tagSlugToId = await seedTags();
		await seedTools(categorySlugToId, tagSlugToId);

		// Recalculate denormalized counts after seeding
		await recalculateToolCounts();

		console.log("\n✨ Database seeded successfully!");
	} catch (error: unknown) {
		console.error("\n❌ Seed failed:", error);
		process.exit(1);
	}
}

main();
