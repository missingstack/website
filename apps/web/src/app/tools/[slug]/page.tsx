import { services } from "@missingstack/api/context";
import type { ToolData } from "@missingstack/api/types";
import {
	Bookmark,
	Check,
	ChevronRight,
	ExternalLink,
	Globe,
	Share2,
} from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { ToolCard } from "~/components/home/tool-card";
import { StructuredData } from "~/components/structured-data";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
	breadcrumb,
	faqPage,
	generateSEOMetadata,
	softwareApplication,
} from "~/lib/seo";

interface ToolPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: ToolPageProps): Promise<Metadata> {
	const { slug } = await params;
	const tool = await getToolBySlug(slug);

	if (!tool) {
		return generateSEOMetadata({
			title: "Tool Not Found",
			description: "The requested tool could not be found.",
			noindex: true,
		});
	}

	// Create concise description under 155 characters
	const baseDescription = tool.tagline || tool.description.slice(0, 100);
	const description =
		baseDescription.length > 150
			? `${baseDescription.slice(0, 147)}...`
			: baseDescription;

	return generateSEOMetadata({
		title: `${tool.name} - ${tool.tagline}`,
		description,
		image: tool.logo,
		url: `/tools/${slug}`,
		type: "article",
	});
}

function getBadgeVariant(
	pricing: string,
): "blue" | "green" | "purple" | "gold" | "default" {
	const lower = pricing.toLowerCase();
	if (lower === "free") return "green";
	if (lower === "freemium") return "blue";
	if (lower === "open source") return "purple";
	if (lower === "paid" || lower === "enterprise") return "gold";
	return "default";
}

async function getToolBySlug(slug: string) {
	"use cache";
	cacheLife("days");
	cacheTag("tools", `tool-${slug}`);

	return services.toolService.getBySlug(slug);
}

async function getCategoryById(id: string) {
	"use cache";
	cacheLife("days");
	cacheTag("categories");

	return services.categoryService.getById(id);
}

async function getToolsByCategory(categoryId: string, pageSize: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools", `category-${categoryId}`);

	return services.toolService.getByCategory(categoryId, { limit: pageSize });
}

async function ToolPageContent({
	paramsPromise,
}: {
	paramsPromise: Promise<{ slug: string }>;
}) {
	const { slug } = await paramsPromise;
	const tool = await getToolBySlug(slug);

	if (!tool) {
		notFound();
	}

	// Get category info (use first category for breadcrumbs and related tools)
	const primaryCategoryId = tool.categoryIds[0];

	// Get all categories for this tool
	const allCategories = await Promise.all(
		tool.categoryIds.map((id) => getCategoryById(id)),
	);
	const validCategories = allCategories.filter(
		(cat): cat is NonNullable<typeof cat> => cat !== null,
	);

	// Get related tools (from first category)
	const relatedResult = primaryCategoryId
		? await getToolsByCategory(primaryCategoryId, 4)
		: { items: [] };

	const relatedTools = relatedResult.items
		.filter((t) => t.id !== tool.id)
		.slice(0, 3);

	// Features (mock data)
	const features = [
		"Real-time collaboration",
		"Cloud-based storage",
		"Cross-platform sync",
		"API access available",
		"Export to multiple formats",
		"Team management",
	];

	const breadcrumbItems = [
		{ name: "Home", url: "/" },
		...validCategories.map((cat) => ({
			name: cat.name,
			url: `/categories/${cat.slug}`,
		})),
		{ name: tool.name, url: `/tools/${tool.slug}` },
	];

	return (
		<>
			<StructuredData data={breadcrumb(breadcrumbItems)} />
			<StructuredData
				data={softwareApplication({
					name: tool.name,
					description: `${tool.description} ${tool.tagline}`,
					url: tool.website || `/tools/${tool.slug}`,
					category: validCategories[0]?.name,
				})}
			/>
			<StructuredData
				data={faqPage([
					{
						question: `What is ${tool.name}?`,
						answer: tool.description,
					},
					{
						question: `How much does ${tool.name} cost?`,
						answer: `${tool.name} is a ${tool.pricing} tool.`,
					},
				])}
			/>
			<div className="mx-auto mb-4 max-w-7xl px-4 sm:mb-6 sm:px-6">
				<nav className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs sm:gap-2 sm:text-sm">
					<Link
						href="/"
						className="transition-colors duration-200 hover:text-primary"
					>
						Home
					</Link>
					{validCategories.length > 0 && (
						<>
							<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
							{validCategories.map((cat, index) => (
								<span key={cat.id}>
									{index > 0 && (
										<span className="text-muted-foreground">, </span>
									)}
									<Link
										href={`/categories/${cat.slug}`}
										className="transition-colors duration-200 hover:text-primary"
									>
										{cat.name}
									</Link>
								</span>
							))}
							<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
						</>
					)}
					<span className="font-medium text-primary">{tool.name}</span>
				</nav>
			</div>

			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<section className="mb-8 sm:mb-12">
					<div className="flex flex-col gap-6 sm:gap-8 md:flex-row">
						<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-secondary/50 shadow-lg transition-transform duration-300 hover:scale-105 sm:h-24 sm:w-24 md:h-32 md:w-32 md:rounded-3xl">
							<Image
								src={tool.logo}
								alt={`${tool.name} - ${validCategories[0]?.name || "Tool"} tool logo`}
								fill
								className="object-cover"
								sizes="128px"
								priority
								unoptimized
							/>
						</div>

						<div className="min-w-0 flex-1">
							<div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3 sm:gap-3">
								<h1 className="font-serif text-2xl text-primary leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
									{tool.name}
									{validCategories.length > 0 && (
										<span className="text-muted-foreground/70">
											{" "}
											- {validCategories[0]?.name} Tool
										</span>
									)}
								</h1>
							</div>

							<p className="mb-3 text-base text-muted-foreground sm:mb-4 sm:text-lg lg:text-xl">
								{tool.tagline}
							</p>

							<p className="mb-4 max-w-2xl text-muted-foreground text-sm leading-relaxed sm:mb-6 sm:text-base">
								{tool.description}
							</p>

							<div className="mb-4 flex flex-wrap gap-1.5 sm:mb-6 sm:gap-2">
								<Badge
									variant={getBadgeVariant(tool.pricing)}
									className="text-xs sm:text-sm"
								>
									{tool.pricing}
								</Badge>
								{validCategories.map((cat) => (
									<Badge
										key={cat.id}
										variant="outline"
										className="text-xs sm:text-sm"
									>
										{cat.name}
									</Badge>
								))}
							</div>

							<div className="flex flex-wrap items-center gap-2 sm:gap-3">
								<Button
									size="lg"
									className="gap-2 rounded-full px-5 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-primary/30 hover:shadow-xl active:scale-95 sm:px-6"
									asChild
								>
									<a
										href={
											tool.website ? `${tool.website}?ref=missingstack` : "#"
										}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
										<span className="text-xs sm:text-sm">Visit Website</span>
										<ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
									</a>
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="gap-2 rounded-full px-5 transition-all duration-300 hover:scale-105 active:scale-95 sm:px-6"
								>
									<Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
									<span className="hidden text-xs sm:inline sm:text-sm">
										Save to Stack
									</span>
									<span className="sm:hidden">Save</span>
								</Button>
								<Button
									size="lg"
									variant="ghost"
									className="min-w-[44px] rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
								>
									<Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								</Button>
							</div>
						</div>
					</div>
				</section>

				<div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
					<div className="space-y-6 sm:space-y-8 lg:col-span-2">
						<section className="rounded-xl border border-border/50 bg-white p-5 transition-shadow duration-300 hover:shadow-md sm:rounded-2xl sm:p-6 lg:p-8">
							<div className="mb-3 flex items-center justify-between sm:mb-4">
								<h2 className="font-serif text-primary text-xl sm:text-2xl">
									About {tool.name}
								</h2>
								{tool.updatedAt && (
									<time
										dateTime={tool.updatedAt.toISOString()}
										className="text-muted-foreground text-xs sm:text-sm"
									>
										Last updated:{" "}
										{tool.updatedAt.toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</time>
								)}
							</div>
							<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:mb-6 sm:text-base">
								{tool.description} This tool has been trusted by thousands of
								teams worldwide and continues to be one of the most popular
								choices in its category. Whether you're a solo developer or part
								of a large enterprise team, {tool.name} scales with your needs.
								{validCategories.length > 0 && (
									<>
										{" "}
										Looking for more{" "}
										<Link
											href={`/categories/${validCategories[0]?.slug}`}
											className="font-medium text-primary underline transition-colors hover:text-primary/80"
										>
											{validCategories[0]?.name} tools
										</Link>
										?
									</>
								)}
							</p>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								With continuous updates and a responsive support team,{" "}
								{tool.name} ensures you always have access to the latest
								features and improvements. The intuitive interface makes it easy
								to get started while powerful features satisfy advanced users.
							</p>
						</section>

						<section className="rounded-xl border border-border/50 bg-white p-5 transition-shadow duration-300 hover:shadow-md sm:rounded-2xl sm:p-6 lg:p-8">
							<h2 className="mb-4 font-serif text-primary text-xl sm:mb-6 sm:text-2xl">
								Key Features
							</h2>
							<div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
								{features.map((feature) => (
									<div
										key={feature}
										className="flex items-center gap-2.5 sm:gap-3"
									>
										<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 transition-transform duration-200 hover:scale-110 sm:h-6 sm:w-6">
											<Check className="h-3 w-3 text-green-600 sm:h-4 sm:w-4" />
										</div>
										<span className="text-muted-foreground text-xs sm:text-sm">
											{feature}
										</span>
									</div>
								))}
							</div>
						</section>

						<section className="rounded-xl border border-border/50 bg-white p-5 transition-shadow duration-300 hover:shadow-md sm:rounded-2xl sm:p-6 lg:p-8">
							<h2 className="mb-4 font-serif text-primary text-xl sm:mb-6 sm:text-2xl">
								Screenshots
							</h2>
							<div className="grid grid-cols-2 gap-3 sm:gap-4">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="flex aspect-video items-center justify-center rounded-lg bg-secondary/50 transition-transform duration-200 hover:scale-105 sm:rounded-xl"
									>
										<span className="text-muted-foreground text-xs sm:text-sm">
											Screenshot {i}
										</span>
									</div>
								))}
							</div>
						</section>
					</div>

					<div className="space-y-4 self-start sm:space-y-6 lg:sticky lg:top-28">
						<div className="rounded-xl border border-border/50 bg-white p-4 transition-shadow duration-300 hover:shadow-md sm:rounded-2xl sm:p-5 lg:p-6">
							<h3 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider sm:mb-4 sm:text-sm">
								Quick Info
							</h3>

							<div className="space-y-3 sm:space-y-4">
								<div>
									<span className="text-[10px] text-muted-foreground uppercase tracking-wider sm:text-xs">
										Pricing
									</span>
									<p className="font-medium text-primary text-sm sm:text-base">
										{tool.pricing}
									</p>
								</div>

								<Separator />

								<div>
									<span className="text-[10px] text-muted-foreground uppercase tracking-wider sm:text-xs">
										{validCategories.length === 1 ? "Category" : "Categories"}
									</span>
									<p className="font-medium text-primary text-sm sm:text-base">
										{validCategories.length > 0
											? validCategories.map((cat) => cat.name).join(", ")
											: "Uncategorized"}
									</p>
								</div>

								<Separator />

								<div>
									<span className="mb-2 block text-[10px] text-muted-foreground uppercase tracking-wider sm:text-xs">
										Available on
									</span>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-border/50 bg-white p-4 transition-shadow duration-300 hover:shadow-md sm:rounded-2xl sm:p-5 lg:p-6">
							<h3 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider sm:mb-4 sm:text-sm">
								Company
							</h3>
							<div className="space-y-2.5 text-xs sm:space-y-3 sm:text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Founded</span>
									<span className="font-medium">2020</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Headquarters</span>
									<span className="font-medium">San Francisco</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Team Size</span>
									<span className="font-medium">50-100</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{relatedTools.length > 0 && (
					<section className="mt-12 sm:mt-16">
						<div className="mb-6 flex items-center justify-between sm:mb-8">
							<h2 className="font-serif text-primary text-xl sm:text-2xl">
								Similar Tools
							</h2>
							<Link
								href="/discover"
								className="flex items-center gap-1 text-primary text-xs transition-all duration-200 hover:gap-1.5 hover:underline sm:text-sm"
							>
								View all
								<ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
							</Link>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
							{relatedTools.map((relatedTool) => (
								<ToolCard key={relatedTool.id} tool={relatedTool as ToolData} />
							))}
						</div>
					</section>
				)}
			</div>
		</>
	);
}

function ToolPageSkeleton() {
	return (
		<>
			<div className="mx-auto mb-6 max-w-7xl px-6">
				<Skeleton className="h-5 w-64" />
			</div>

			<div className="mx-auto max-w-7xl px-6">
				<section className="mb-12">
					<div className="flex flex-col gap-8 md:flex-row">
						<Skeleton className="h-24 w-24 rounded-3xl md:h-32 md:w-32" />
						<div className="flex-1 space-y-4">
							<Skeleton className="h-12 w-64" />
							<Skeleton className="h-6 w-96" />
							<Skeleton className="h-20 w-full max-w-2xl" />
							<div className="flex gap-2">
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-6 w-16" />
								<Skeleton className="h-6 w-24" />
							</div>
							<div className="flex gap-3">
								<Skeleton className="h-12 w-40 rounded-full" />
								<Skeleton className="h-12 w-36 rounded-full" />
							</div>
						</div>
					</div>
				</section>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div className="space-y-8 lg:col-span-2">
						<Skeleton className="h-64 rounded-2xl" />
						<Skeleton className="h-48 rounded-2xl" />
					</div>
					<div className="space-y-6">
						<Skeleton className="h-64 rounded-2xl" />
						<Skeleton className="h-40 rounded-2xl" />
					</div>
				</div>
			</div>
		</>
	);
}

export default async function ToolPage({ params }: ToolPageProps) {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header />

			<main className="flex-1 py-6 sm:py-8">
				<Suspense fallback={<ToolPageSkeleton />}>
					<ToolPageContent paramsPromise={params} />
				</Suspense>
			</main>

			<Footer />
		</div>
	);
}

async function getTools() {
	"use cache";
	cacheLife("days");
	cacheTag("tools");

	return services.toolService.getAll({ limit: 50 });
}

export async function generateStaticParams() {
	const result = await getTools();
	return result.items.map((tool) => ({
		slug: tool.slug,
	}));
}
