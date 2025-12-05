import type { CategoryWithCount } from "@missingstack/api/types";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Container } from "~/components/ui/container";
import { getIcon } from "~/lib/icons";

interface CategoryHeaderProps {
	category: CategoryWithCount;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
	const CategoryIcon = getIcon(category.icon);

	return (
		<Container className="mb-8 sm:mb-12">
			<div className="flex flex-col justify-between gap-4 sm:gap-6 lg:flex-row lg:items-end">
				<div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
					<div className="rounded-xl bg-secondary/80 p-3 transition-transform duration-200 hover:scale-105 sm:rounded-2xl sm:p-4">
						<CategoryIcon className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
					</div>
					<div className="min-w-0 flex-1">
						<h1 className="mb-2 text-2xl text-primary leading-tight sm:mb-3 sm:text-3xl md:text-4xl lg:text-5xl">
							{category.name} Tools
						</h1>
						<p className="max-w-2xl text-muted-foreground text-sm sm:text-base lg:text-lg">
							Browse our{" "}
							<Link
								href="/"
								className="font-medium text-primary underline transition-colors hover:text-primary/80"
							>
								curated directory
							</Link>{" "}
							to discover the best {category.name.toLowerCase()} tools.{" "}
							{category.description ||
								`Find ${category.name.toLowerCase()} tools for your stack.`}
						</p>
						<div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-4 sm:gap-4">
							<Badge variant="secondary" className="text-xs sm:text-sm">
								{category.toolCount} tools
							</Badge>
							{category.updatedAt && (
								<time
									dateTime={category.updatedAt.toISOString()}
									className="text-muted-foreground text-xs sm:text-sm"
								>
									Updated{" "}
									{category.updatedAt.toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</time>
							)}
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
}
