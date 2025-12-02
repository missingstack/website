import { services } from "@missingstack/api/context";
import { ArrowRight, Sparkles } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";

async function getStats() {
	"use cache";
	cacheLife("days");
	cacheTag("stats");

	return services.statsService.getStats();
}

export async function HeroSection() {
	const stats = await getStats();

	return (
		<section className="relative w-full pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
			<Container>
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-blue-100/40 blur-3xl sm:h-64 sm:w-64" />
					<div className="absolute top-20 right-20 h-40 w-40 rounded-full bg-purple-100/30 blur-3xl sm:h-80 sm:w-80" />
					<div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-32 w-64 rounded-full bg-amber-100/20 blur-3xl sm:h-40 sm:w-96" />
				</div>

				<div className="relative z-10">
					<div className="mb-6 flex justify-center sm:mb-8">
						<Badge
							variant="secondary"
							className="gap-2 px-3 py-1.5 transition-all duration-200 hover:scale-105 sm:px-4 sm:py-2"
						>
							<Sparkles className="h-3 w-3 text-yellow-500 sm:h-3.5 sm:w-3.5" />
							<span className="text-xs sm:text-sm">
								{stats.totalTools} tools curated
							</span>
						</Badge>
					</div>

					<div className="mx-auto mb-8 max-w-4xl text-center sm:mb-12">
						<h1 className="mb-4 text-3xl text-primary leading-[1.1] tracking-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
							Discover tools
							<br />
							<span className="text-muted-foreground/80 italic">
								to build what's next
							</span>
						</h1>

						<p className="mx-auto max-w-2xl px-4 text-base text-muted-foreground leading-relaxed sm:px-0 sm:text-lg md:text-xl">
							A curated discovery platform for developers, designers, and
							founders. Find the perfect tools to build your modern product
							stack.
						</p>
					</div>

					<div className="mb-12 flex flex-col justify-center gap-3 px-4 sm:mb-16 sm:flex-row sm:gap-4 sm:px-0">
						<Button
							size="lg"
							className="gap-2 rounded-full px-6 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-primary/30 hover:shadow-xl sm:px-8"
							asChild
						>
							<Link href="/discover">
								Start Exploring
								<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="rounded-full px-6 transition-all duration-300 hover:scale-105 sm:px-8"
							asChild
						>
							<Link href="/categories">Browse Categories</Link>
						</Button>
					</div>

					<div className="flex flex-wrap justify-center gap-6 px-4 sm:gap-8 md:gap-12 lg:gap-16">
						<div className="text-center transition-transform duration-200 hover:scale-105">
							<div className="font-bold text-2xl text-primary sm:text-3xl md:text-4xl">
								{stats.totalTools}+
							</div>
							<div className="mt-1 text-muted-foreground text-xs sm:text-sm">
								Curated Tools
							</div>
						</div>
						<div className="text-center transition-transform duration-200 hover:scale-105">
							<div className="font-bold text-2xl text-primary sm:text-3xl md:text-4xl">
								{stats.totalCategories}
							</div>
							<div className="mt-1 text-muted-foreground text-xs sm:text-sm">
								Categories
							</div>
						</div>
						<div className="text-center transition-transform duration-200 hover:scale-105">
							<div className="font-bold text-2xl text-primary sm:text-3xl md:text-4xl">
								Daily
							</div>
							<div className="mt-1 text-muted-foreground text-xs sm:text-sm">
								Updates
							</div>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
