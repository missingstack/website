import { db } from "@missingstack/db";
import { createAffiliateLinkService } from "./features/affiliate-links/affiliate-links.module";
import type { AffiliateLinksServiceInterface } from "./features/affiliate-links/affiliate-links.types";
import { createCategoryService } from "./features/categories/categories.module";
import type { CategoriesServiceInterface } from "./features/categories/categories.types";
import { createNewsletterService } from "./features/newsletter/newsletter.module";
import type { NewsletterServiceInterface } from "./features/newsletter/newsletter.types";
import { createSectionService } from "./features/sections/sections.module";
import type { SectionsServiceInterface } from "./features/sections/sections.types";
import { createSponsorshipService } from "./features/sponsorships/sponsorships.module";
import type { SponsorshipsServiceInterface } from "./features/sponsorships/sponsorships.types";
import { createStackService } from "./features/stacks/stacks.module";
import type { StacksServiceInterface } from "./features/stacks/stacks.types";
import { createStatsService } from "./features/stats/stats.module";
import type { StatsServiceInterface } from "./features/stats/stats.types";
import { createTagService } from "./features/tags/tags.module";
import type { TagsServiceInterface } from "./features/tags/tags.types";
import { createToolService } from "./features/tools/tools.module";
import type { ToolsServiceInterface } from "./features/tools/tools.types";

export type ServiceInterface = {
	toolService: ToolsServiceInterface;
	categoryService: CategoriesServiceInterface;
	tagService: TagsServiceInterface;
	stackService: StacksServiceInterface;
	sectionService: SectionsServiceInterface;
	statsService: StatsServiceInterface;
	newsletterService: NewsletterServiceInterface;
	sponsorshipService: SponsorshipsServiceInterface;
	affiliateLinkService: AffiliateLinksServiceInterface;
};

const toolService = createToolService(db);
const categoryService = createCategoryService(db);
const tagService = createTagService(db);
const stackService = createStackService(db);
const sectionService = createSectionService();
const statsService = createStatsService(db);
const newsletterService = createNewsletterService();
const sponsorshipService = createSponsorshipService(db);
const affiliateLinkService = createAffiliateLinkService(db);

export const services: ServiceInterface = {
	toolService,
	categoryService,
	tagService,
	stackService,
	sectionService,
	statsService,
	newsletterService,
	sponsorshipService,
	affiliateLinkService,
};
