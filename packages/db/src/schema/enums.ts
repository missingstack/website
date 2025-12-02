/**
 * Drizzle PostgreSQL Enums
 *
 * Defines all enum types used across the schema.
 * These map directly to PostgreSQL ENUM types for type safety.
 */

import { pgEnum } from "drizzle-orm/pg-core";

// Platform enum - supported platforms for tools
export const platformEnum = pgEnum("platform", [
	"Web",
	"Mac",
	"Windows",
	"Linux",
	"iOS",
	"Android",
	"Extension",
	"API",
]);

// Pricing model enum
export const pricingEnum = pgEnum("pricing_model", [
	"Free",
	"Freemium",
	"Paid",
	"Open Source",
	"Enterprise",
]);

// Tag type enum - categorizes different kinds of tags
export const tagTypeEnum = pgEnum("tag_type", [
	"pricing",
	"platform",
	"compliance",
	"deployment",
	"stage",
	"feature",
]);

// Badge variant enum - visual styling for badges
export const badgeVariantEnum = pgEnum("badge_variant", [
	"default",
	"blue",
	"green",
	"purple",
	"gold",
	"secondary",
	"outline",
]);

// Section type enum - for homepage sections
export const sectionTypeEnum = pgEnum("section_type", ["filter", "category"]);

// Section filter enum - predefined filter types
export const sectionFilterEnum = pgEnum("section_filter", [
	"featured",
	"popular",
	"newest",
]);

// Section layout enum - display layouts
export const sectionLayoutEnum = pgEnum("section_layout", [
	"grid",
	"large",
	"carousel",
]);

// Icon color enum - for section icons
export const iconColorEnum = pgEnum("icon_color", [
	"emerald",
	"orange",
	"blue",
	"purple",
	"pink",
	"green",
	"cyan",
	"amber",
	"slate",
	"red",
	"yellow",
	"indigo",
	"teal",
]);

// Sponsorship tier enum - for sponsored/featured listings
export const sponsorshipTierEnum = pgEnum("sponsorship_tier", [
	"basic",
	"premium",
	"enterprise",
]);

// License enum - software licenses for tools
export const licenseEnum = pgEnum("license", [
	"agpl-3",
	"mit",
	"apache-2",
	"gpl-3",
	"mpl-2",
	"bsd-3-clause",
	"gpl-2",
	"lgpl-2-1",
	"bsd-2-clause",
	"epl-2",
	"isc",
	"lgpl-3",
]);

// Payment status enum - for sponsorship payments
export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"completed",
	"failed",
	"refunded",
]);

export type Platform = (typeof platformEnum.enumValues)[number];
export type PricingModel = (typeof pricingEnum.enumValues)[number];
export type TagType = (typeof tagTypeEnum.enumValues)[number];
export type BadgeVariant = (typeof badgeVariantEnum.enumValues)[number];
export type SectionType = (typeof sectionTypeEnum.enumValues)[number];
export type SectionFilter = (typeof sectionFilterEnum.enumValues)[number];
export type SectionLayout = (typeof sectionLayoutEnum.enumValues)[number];
export type IconColor = (typeof iconColorEnum.enumValues)[number];
export type SponsorshipTier = (typeof sponsorshipTierEnum.enumValues)[number];
export type License = (typeof licenseEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
