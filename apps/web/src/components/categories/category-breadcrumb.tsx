import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Container } from "~/components/ui/container";

interface BreadcrumbItem {
	name: string;
	href: string;
}

interface CategoryBreadcrumbProps {
	items: BreadcrumbItem[];
	currentPage: string;
}

export function CategoryBreadcrumb({
	items,
	currentPage,
}: CategoryBreadcrumbProps) {
	return (
		<Container className="mb-4 sm:mb-6">
			<nav className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs sm:gap-2 sm:text-sm">
				{items.map((item, index) => (
					<div key={item.href} className="flex items-center gap-1.5 sm:gap-2">
						<Link
							href={item.href}
							className="transition-colors duration-200 hover:text-primary"
						>
							{item.name}
						</Link>
						{index < items.length - 1 && (
							<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
						)}
					</div>
				))}
				<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
				<span className="font-medium text-primary">{currentPage}</span>
			</nav>
		</Container>
	);
}
