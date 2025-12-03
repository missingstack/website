import {
	badgeVariantEnum,
	licenseEnum,
	platformEnum,
	pricingEnum,
	tagTypeEnum,
} from "@missingstack/db/schema/enums";

// Export enum values as readonly arrays
export const PRICING_OPTIONS = pricingEnum.enumValues;
export const PLATFORM_OPTIONS = platformEnum.enumValues;
export const LICENSE_OPTIONS = licenseEnum.enumValues;
export const TAG_TYPE_OPTIONS = tagTypeEnum.enumValues;
export const BADGE_VARIANT_OPTIONS = badgeVariantEnum.enumValues;
