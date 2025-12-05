import { ToolCardSkeleton } from "~/components/home/tool-card";
import { Container } from "~/components/ui/container";
import { Skeleton } from "~/components/ui/skeleton";

export function CategoryPageSkeleton() {
	return (
		<>
			<Container className="mb-6">
				<Skeleton className="h-5 w-48" />
			</Container>
			<Container className="mb-12">
				<div className="flex items-start gap-5">
					<Skeleton className="h-18 w-18 rounded-2xl" />
					<div className="flex-1">
						<Skeleton className="mb-3 h-12 w-64" />
						<Skeleton className="mb-4 h-6 w-96" />
						<Skeleton className="h-6 w-32" />
					</div>
				</div>
			</Container>
			<Container>
				<div className="flex flex-col gap-8 lg:flex-row">
					<aside className="w-full shrink-0 lg:w-64">
						<div className="space-y-4">
							<Skeleton className="h-64 rounded-xl" />
							<Skeleton className="h-48 rounded-xl" />
						</div>
					</aside>
					<div className="flex-1">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<ToolCardSkeleton key={`skeleton-${i.toString()}`} />
							))}
						</div>
					</div>
				</div>
			</Container>
		</>
	);
}
