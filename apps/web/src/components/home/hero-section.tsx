import { dependencies } from "@missingstack/api/context";
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

	return dependencies.statsService.getStats();
}

export async function HeroSection() {
	const stats = await getStats();

	return (
		<section className="relative w-full pt-16 pb-20">
			<Container>
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
					<div className="absolute top-20 right-20 h-80 w-80 rounded-full bg-purple-100/30 blur-3xl" />
					<div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-40 w-96 rounded-full bg-amber-100/20 blur-3xl" />
				</div>

				<div className="relative z-10">
					<div className="mb-8 flex justify-center">
						<Badge variant="secondary" className="gap-2 px-4 py-2">
							<Sparkles className="h-3.5 w-3.5 text-yellow-500" />
							{stats.totalTools}+ tools curated
						</Badge>
					</div>

					<div className="mx-auto mb-12 max-w-4xl text-center">
						<h1 className="mb-6 font-serif text-5xl text-primary leading-[1.1] tracking-tight md:text-7xl">
							Discover the tools to
							<br />
							<span className="text-muted-foreground/80 italic">
								build what's next
							</span>
						</h1>

						<p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
							A curated discovery platform for developers, designers, and
							founders. Find the perfect tools to build your modern product
							stack.
						</p>
					</div>

					<div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
						<Button
							size="lg"
							className="gap-2 rounded-full px-8 shadow-lg shadow-primary/20"
							asChild
						>
							<Link href="/discover">
								Start Exploring
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="rounded-full px-8"
							asChild
						>
							<Link href="/categories">Browse Categories</Link>
						</Button>
					</div>

					<div className="flex flex-wrap justify-center gap-8 md:gap-16">
						<div className="text-center">
							<div className="font-bold font-serif text-3xl text-primary md:text-4xl">
								{stats.totalTools}+
							</div>
							<div className="mt-1 text-muted-foreground text-sm">
								Curated Tools
							</div>
						</div>
						<div className="text-center">
							<div className="font-bold font-serif text-3xl text-primary md:text-4xl">
								{stats.totalCategories}
							</div>
							<div className="mt-1 text-muted-foreground text-sm">
								Categories
							</div>
						</div>
						<div className="text-center">
							<div className="font-bold font-serif text-3xl text-primary md:text-4xl">
								Daily
							</div>
							<div className="mt-1 text-muted-foreground text-sm">Updates</div>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
