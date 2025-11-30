import { services } from "@missingstack/api/context";
import { Github, Linkedin, Twitter } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Separator } from "~/components/ui/separator";

const RESOURCES = [
	{ name: "Submit a Tool", href: "/submit" as const },
	{ name: "Discover", href: "/discover" as const },
	{ name: "Categories", href: "/categories" as const },
];

export async function getTopCategories() {
	"use cache";
	cacheLife("days");

	const data = await services.categoryService.getTopCategories(6);
	return data || [];
}

export async function getFeaturedTools() {
	"use cache";
	cacheLife("days");

	const data = await services.toolService.getFeatured(6);
	return data || [];
}

export async function Footer() {
	const [categories, featuredTools] = await Promise.all([
		getTopCategories(),
		getFeaturedTools(),
	]);

	return (
		<footer className="bg-primary text-white">
			<div className="mx-auto max-w-7xl px-6 py-16">
				<div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
					<div className="lg:col-span-2">
						<Link href="/" className="mb-5 flex items-center gap-2.5">
							<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-bold font-serif text-primary text-xl italic">
								M
							</div>
							<span className="font-semibold text-lg text-white tracking-tight">
								Missing stack
							</span>
						</Link>
						<p className="mb-6 max-w-sm text-sm text-white/70 leading-relaxed">
							The curated discovery platform for next-generation tools. Find,
							compare, and build your modern product stack with the best tools
							for developers, founders, and startups.
						</p>
						<div className="flex gap-2">
							<a
								href="https://twitter.com/missingstack"
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-xl bg-white/10 p-2.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
								aria-label="Follow us on Twitter"
							>
								<Twitter size={18} />
							</a>
							<a
								href="https://github.com/missingstack"
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-xl bg-white/10 p-2.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
								aria-label="View our GitHub"
							>
								<Github size={18} />
							</a>
							<a
								href="https://linkedin.com/company/missingstack"
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-xl bg-white/10 p-2.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
								aria-label="Connect on LinkedIn"
							>
								<Linkedin size={18} />
							</a>
						</div>
					</div>

					<div>
						<h4 className="mb-5 font-semibold text-sm text-white uppercase tracking-wider">
							Categories
						</h4>
						<ul className="space-y-3">
							{categories.map((cat) => (
								<li key={cat.id}>
									<Link
										href={`/categories/${cat.slug}`}
										className="text-sm text-white/70 transition-colors hover:text-white"
									>
										{cat.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="mb-5 font-semibold text-sm text-white uppercase tracking-wider">
							Featured Tools
						</h4>
						<ul className="space-y-3">
							{featuredTools.map((tool) => (
								<li key={tool.slug}>
									<Link
										href={`/tools/${tool.slug}`}
										className="text-sm text-white/70 transition-colors hover:text-white"
									>
										{tool.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="mb-5 font-semibold text-sm text-white uppercase tracking-wider">
							Resources
						</h4>
						<ul className="space-y-3">
							{RESOURCES.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-sm text-white/70 transition-colors hover:text-white"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<Separator className="my-10 bg-white/20" />

				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					<p className="text-sm text-white/60">
						© 2025 Missing stack. Built in public.
					</p>
					<div className="flex items-center gap-6 text-sm text-white/60">
						<span className="cursor-pointer transition-colors hover:text-white">
							Privacy
						</span>
						<span className="cursor-pointer transition-colors hover:text-white">
							Terms
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
