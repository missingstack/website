import { ToolCardSkeleton } from "~/components/home/tool-card";

interface ToolListStatesProps {
	isLoading: boolean;
	isError: boolean;
	toolCount: number;
}

export function ToolListLoading() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<ToolCardSkeleton key={`skeleton-${i.toString()}`} />
			))}
		</div>
	);
}

export function ToolListError() {
	return (
		<div className="rounded-xl bg-destructive/10 py-12 text-center sm:rounded-2xl sm:py-16">
			<p className="mb-2 text-destructive text-sm sm:text-base">
				Failed to load tools
			</p>
			<p className="text-muted-foreground text-xs sm:text-sm">
				Please try refreshing the page
			</p>
		</div>
	);
}

export function ToolListEmpty() {
	return (
		<div className="rounded-xl bg-secondary/20 py-12 text-center sm:rounded-2xl sm:py-16">
			<p className="mb-2 text-muted-foreground text-sm sm:text-base">
				No tools found
			</p>
			<p className="text-muted-foreground text-xs sm:text-sm">
				Try adjusting your filters or search query
			</p>
		</div>
	);
}

export function ToolListStates({
	isLoading,
	isError,
	toolCount,
}: ToolListStatesProps) {
	if (isLoading) return <ToolListLoading />;
	if (isError) return <ToolListError />;
	if (toolCount === 0) return <ToolListEmpty />;
	return null;
}
