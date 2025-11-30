import { services } from "@missingstack/api/context";
import type { ToolData } from "@missingstack/api/types";
import {
	Bookmark,
	Check,
	ChevronRight,
	Chrome,
	Code2,
	ExternalLink,
	Globe,
	Monitor,
	Share2,
	Smartphone,
} from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { ToolCard } from "~/components/home/tool-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

interface ToolPageProps {
	params: Promise<{ slug: string }>;
}

const platformIcons: Record<
	string,
	React.ComponentType<{ className?: string }>
> = {
	Web: Globe,
	Mac: Monitor,
	Windows: Monitor,
	Linux: Monitor,
	iOS: Smartphone,
	Android: Smartphone,
	Extension: Chrome,
	API: Code2,
};

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

	return (
		<>
			<div className="mx-auto mb-6 max-w-7xl px-6">
				<nav className="flex items-center gap-2 text-muted-foreground text-sm">
					<Link href="/" className="transition-colors hover:text-primary">
						Home
					</Link>
					<ChevronRight className="h-4 w-4" />
					<Link
						href="/discover"
						className="transition-colors hover:text-primary"
					>
						Discover
					</Link>
					<ChevronRight className="h-4 w-4" />
					{validCategories.length > 0 && (
						<>
							{validCategories.map((cat, index) => (
								<span key={cat.id}>
									{index > 0 && (
										<span className="text-muted-foreground">, </span>
									)}
									<Link
										href={`/categories/${cat.slug}`}
										className="transition-colors hover:text-primary"
									>
										{cat.name}
									</Link>
								</span>
							))}
							<ChevronRight className="h-4 w-4" />
						</>
					)}
					<span className="font-medium text-primary">{tool.name}</span>
				</nav>
			</div>

			<div className="mx-auto max-w-7xl px-6">
				<section className="mb-12">
					<div className="flex flex-col gap-8 md:flex-row">
						<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-border/50 bg-secondary/50 shadow-lg md:h-32 md:w-32">
							<Image
								src={tool.logo}
								alt={`${tool.name} logo`}
								fill
								className="object-cover"
								sizes="128px"
								priority
								unoptimized
							/>
						</div>

						<div className="flex-1">
							<div className="mb-3 flex flex-wrap items-center gap-3">
								<h1 className="font-serif text-4xl text-primary md:text-5xl">
									{tool.name}
								</h1>
							</div>

							<p className="mb-4 text-muted-foreground text-xl">
								{tool.tagline}
							</p>

							<p className="mb-6 max-w-2xl text-muted-foreground leading-relaxed">
								{tool.description}
							</p>

							<div className="mb-6 flex flex-wrap gap-2">
								<Badge variant={getBadgeVariant(tool.pricing)}>
									{tool.pricing}
								</Badge>
								{tool.platforms.slice(0, 3).map((platform) => (
									<Badge key={platform} variant="secondary">
										{platform}
									</Badge>
								))}
								{validCategories.map((cat) => (
									<Badge key={cat.id} variant="outline">
										{cat.name}
									</Badge>
								))}
							</div>

							<div className="flex flex-wrap items-center gap-3">
								<Button
									size="lg"
									className="gap-2 rounded-full shadow-lg shadow-primary/20"
									asChild
								>
									<a
										href={tool.website || "#"}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Globe className="h-4 w-4" />
										Visit Website
										<ExternalLink className="h-4 w-4" />
									</a>
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="gap-2 rounded-full"
								>
									<Bookmark className="h-4 w-4" />
									Save to Stack
								</Button>
								<Button size="lg" variant="ghost" className="rounded-full">
									<Share2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</section>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div className="space-y-8 lg:col-span-2">
						<section className="rounded-2xl border border-border/50 bg-white p-8">
							<h2 className="mb-4 font-serif text-2xl text-primary">
								About {tool.name}
							</h2>
							<p className="mb-6 text-muted-foreground leading-relaxed">
								{tool.description} This tool has been trusted by thousands of
								teams worldwide and continues to be one of the most popular
								choices in its category. Whether you're a solo developer or part
								of a large enterprise team, {tool.name} scales with your needs.
							</p>
							<p className="text-muted-foreground leading-relaxed">
								With continuous updates and a responsive support team,{" "}
								{tool.name} ensures you always have access to the latest
								features and improvements. The intuitive interface makes it easy
								to get started while powerful features satisfy advanced users.
							</p>
						</section>

						<section className="rounded-2xl border border-border/50 bg-white p-8">
							<h2 className="mb-6 font-serif text-2xl text-primary">
								Key Features
							</h2>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{features.map((feature) => (
									<div key={feature} className="flex items-center gap-3">
										<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
											<Check className="h-4 w-4 text-green-600" />
										</div>
										<span className="text-muted-foreground">{feature}</span>
									</div>
								))}
							</div>
						</section>

						<section className="rounded-2xl border border-border/50 bg-white p-8">
							<h2 className="mb-6 font-serif text-2xl text-primary">
								Screenshots
							</h2>
							<div className="grid grid-cols-2 gap-4">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="flex aspect-video items-center justify-center rounded-xl bg-secondary/50"
									>
										<span className="text-muted-foreground text-sm">
											Screenshot {i}
										</span>
									</div>
								))}
							</div>
						</section>
					</div>

					<div className="space-y-6 self-start lg:sticky lg:top-28">
						<div className="rounded-2xl border border-border/50 bg-white p-6">
							<h3 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
								Quick Info
							</h3>

							<div className="space-y-4">
								<div>
									<span className="text-muted-foreground text-xs uppercase tracking-wider">
										Pricing
									</span>
									<p className="font-medium text-primary">{tool.pricing}</p>
								</div>

								<Separator />

								<div>
									<span className="text-muted-foreground text-xs uppercase tracking-wider">
										{validCategories.length === 1 ? "Category" : "Categories"}
									</span>
									<p className="font-medium text-primary">
										{validCategories.length > 0
											? validCategories.map((cat) => cat.name).join(", ")
											: "Uncategorized"}
									</p>
								</div>

								<Separator />

								<div>
									<span className="mb-2 block text-muted-foreground text-xs uppercase tracking-wider">
										Available on
									</span>
									<div className="flex flex-wrap gap-2">
										{tool.platforms.map((platform) => {
											const Icon = platformIcons[platform] || Globe;
											return (
												<div
													key={platform}
													className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-sm"
												>
													<Icon className="h-4 w-4 text-muted-foreground" />
													<span>{platform}</span>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						</div>

						<div className="rounded-2xl border border-border/50 bg-white p-6">
							<h3 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
								Company
							</h3>
							<div className="space-y-3 text-sm">
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
					<section className="mt-16">
						<div className="mb-8 flex items-center justify-between">
							<h2 className="font-serif text-2xl text-primary">
								Similar Tools
							</h2>
							<Link
								href="/discover"
								className="flex items-center gap-1 text-primary text-sm hover:underline"
							>
								View all
								<ChevronRight className="h-4 w-4" />
							</Link>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

			<main className="flex-1 py-8">
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
