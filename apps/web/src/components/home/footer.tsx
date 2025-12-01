import { services } from "@missingstack/api/context";
import { Linkedin, Twitter } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Separator } from "~/components/ui/separator";

const RESOURCES = [
	{ name: "Advertise", href: "/advertise" as const },
	{ name: "Discover", href: "/discover" as const },
	{ name: "Categories", href: "/categories" as const },
];

export async function getAllCategoriesWithCounts() {
	"use cache";
	cacheLife("days");
	cacheTag("categories");

	const data = await services.categoryService.getAllWithCounts();
	return data || [];
}

export async function getFeaturedTools() {
	"use cache";
	cacheLife("days");
	cacheTag("tools");

	const data = await services.toolService.getFeatured(6);
	return data || [];
}

export async function Footer() {
	const [categories, featuredTools] = await Promise.all([
		getAllCategoriesWithCounts(),
		getFeaturedTools(),
	]);

	// Filter categories with tools and sort by tool count
	const categoriesWithTools = categories
		.filter((c) => c.toolCount > 0)
		.sort((a, b) => b.toolCount - a.toolCount);

	return (
		<footer className="bg-primary text-white">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
				<div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
					<div className="lg:col-span-2">
						<Link
							href="/"
							className="mb-4 flex items-center gap-2 transition-transform duration-200 hover:scale-105 active:scale-95 sm:mb-5 sm:gap-2.5"
						>
							<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white font-bold font-serif text-lg text-primary italic transition-transform duration-200 hover:scale-110 sm:h-9 sm:w-9 sm:text-xl">
								M
							</div>
							<span className="font-semibold text-base text-white tracking-tight sm:text-lg">
								Missing stack
							</span>
						</Link>
						<p className="mb-5 max-w-sm text-white/70 text-xs leading-relaxed sm:mb-6 sm:text-sm">
							The curated discovery platform for next-generation tools. Find,
							compare, and build your modern product stack with the best tools
							for developers, founders, and startups.
						</p>
						<div className="flex gap-2">
							<a
								href="https://twitter.com/@MissingstackHQ"
								target="_blank"
								rel="noopener noreferrer"
								className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-white/10 p-2.5 text-white/70 transition-all duration-200 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95"
								aria-label="Follow us on Twitter"
							>
								<Twitter size={18} />
							</a>
							<a
								href="https://linkedin.com/company/missingstudio"
								target="_blank"
								rel="noopener noreferrer"
								className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-white/10 p-2.5 text-white/70 transition-all duration-200 hover:scale-110 hover:bg-white/20 hover:text-white active:scale-95"
								aria-label="Connect on LinkedIn"
							>
								<Linkedin size={18} />
							</a>
						</div>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-white text-xs uppercase tracking-wider sm:mb-5 sm:text-sm">
							Categories
						</h4>
						<ul className="space-y-2.5 sm:space-y-3">
							{categoriesWithTools.map((cat) => (
								<li key={cat.id}>
									<Link
										href={`/categories/${cat.slug}`}
										className="text-white/70 text-xs transition-all duration-200 hover:translate-x-1 hover:text-white sm:text-sm"
									>
										{cat.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-white text-xs uppercase tracking-wider sm:mb-5 sm:text-sm">
							Featured Tools
						</h4>
						<ul className="space-y-2.5 sm:space-y-3">
							{featuredTools.map((tool) => (
								<li key={tool.slug}>
									<Link
										href={`/tools/${tool.slug}`}
										className="text-white/70 text-xs transition-all duration-200 hover:translate-x-1 hover:text-white sm:text-sm"
									>
										{tool.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-white text-xs uppercase tracking-wider sm:mb-5 sm:text-sm">
							Resources
						</h4>
						<ul className="space-y-2.5 sm:space-y-3">
							{RESOURCES.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-white/70 text-xs transition-all duration-200 hover:translate-x-1 hover:text-white sm:text-sm"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<Separator className="my-8 bg-white/20 sm:my-10" />

				<div className="flex flex-col items-center justify-between gap-4 text-xs sm:flex-row sm:text-sm">
					<p className="text-white/60">
						© 2025 Missing stack. Built in public.
					</p>
					<div className="flex items-center gap-4 text-white/60 sm:gap-6">
						<span className="cursor-pointer transition-colors duration-200 hover:text-white">
							Privacy
						</span>
						<span className="cursor-pointer transition-colors duration-200 hover:text-white">
							Terms
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
