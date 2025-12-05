import Link from "next/link";
import { Container } from "~/components/ui/container";

interface DiscoverPageHeaderProps {
	totalTools: number;
	totalCategories: number;
}

export function DiscoverPageHeader({
	totalTools,
	totalCategories,
}: DiscoverPageHeaderProps) {
	return (
		<Container className="mb-8 sm:mb-12">
			<div className="flex flex-col justify-between gap-4 sm:gap-6 lg:flex-row lg:items-end">
				<div>
					<h1 className="mb-2 text-3xl text-primary leading-tight sm:mb-3 sm:text-4xl md:text-5xl">
						Discover & Search Tools
					</h1>
					<p className="max-w-2xl text-muted-foreground text-sm sm:text-base lg:text-lg">
						Browse our{" "}
						<Link
							href="/"
							className="font-medium text-primary underline transition-colors hover:text-primary/80"
						>
							curated directory
						</Link>{" "}
						to discover {totalTools}+ tools across {totalCategories} categories.
						Filter by category, pricing, platform, and more.
					</p>
				</div>
			</div>
		</Container>
	);
}
