import { ToolCardSkeleton } from "~/components/home/tool-card";
import { Container } from "~/components/ui/container";
import { Skeleton } from "~/components/ui/skeleton";

export function StackContentSkeleton() {
	return (
		<Container>
			<div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
				<aside className="w-full shrink-0 lg:w-64">
					<div className="space-y-4">
						<Skeleton className="h-48 rounded-xl sm:h-64" />
						<Skeleton className="h-40 rounded-xl sm:h-48" />
					</div>
				</aside>
				<div className="flex-1">
					<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<ToolCardSkeleton key={`skeleton-${i.toString()}`} />
						))}
					</div>
				</div>
			</div>
		</Container>
	);
}
