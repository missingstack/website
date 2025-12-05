import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Container } from "~/components/ui/container";

interface StacksHeroProps {
	totalStacks: number;
	topStackNames: string[];
	remainingCount: number;
}

export function StacksHero({
	totalStacks,
	topStackNames,
	remainingCount,
}: StacksHeroProps) {
	return (
		<Container className="mb-12 sm:mb-16">
			<div className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
				<Badge
					variant="blue"
					className="mb-3 transition-all duration-200 hover:scale-105 sm:mb-4"
				>
					<TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
					<span className="text-xs sm:text-sm">{totalStacks} Stacks</span>
				</Badge>
				<h1 className="mb-3 text-3xl text-primary leading-tight sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
					Browse Tools by Technology Stack
				</h1>
				<p className="px-4 text-base text-muted-foreground sm:px-0 sm:text-lg">
					Browse our{" "}
					<Link
						href="/"
						className="font-medium text-primary underline transition-colors hover:text-primary/80"
					>
						curated directory
					</Link>{" "}
					by technology stack. Discover the perfect tools organized by what you
					need. Popular stacks: {topStackNames.join(", ")}, and {remainingCount}{" "}
					more.
				</p>
			</div>
		</Container>
	);
}
