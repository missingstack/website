/**
 * Shared type helpers for extending base entity types
 *
 * Provides a consistent pattern for creating extended types:
 * - EntityWith<T, P> - Generic helper for extending any entity type
 *
 * Usage:
 *   type CategoryWithCount = CategoryWith<{ toolCount: number }>;
 *   type ToolWithSponsorship = ToolWith<{ isSponsored?: boolean }>;
 */

/**
 * Generic type helper for extending an entity type with additional properties
 * @template T - The base entity type
 * @template P - The properties to add (defaults to empty object)
 */
export type EntityWith<T, P = Record<string, unknown>> = T & P;
