"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { trpc, trpcClient } from "~/utils/trpc";

export default function Home() {
	const baseOptions = {
		limit: 8,
		sortBy: "newest" as const,
		sortOrder: "desc" as const,
	};

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = useInfiniteQuery({
		queryKey: trpc.tools.getAllTools.queryKey(baseOptions),
		queryFn: ({ pageParam }) => {
			return trpcClient.tools.getAllTools.query({
				...baseOptions,
				cursor: pageParam as string | null | undefined,
			});
		},
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	if (isLoading) {
		return (
			<div className="container max-w-3xl px-4 py-2">Loading tools...</div>
		);
	}

	if (error) {
		return (
			<div className="container max-w-3xl px-4 py-2">
				Error: {error.message}
			</div>
		);
	}

	const allTools = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="container max-w-3xl px-4 py-2">
			<h1 className="mb-4 font-bold text-2xl">All Tools</h1>
			<div className="space-y-4">
				{allTools.length === 0 ? (
					<p>No tools found.</p>
				) : (
					<>
						<div className="grid gap-4">
							{allTools.map((tool) => (
								<div
									key={tool.id}
									className="rounded-lg border p-4 transition-shadow hover:shadow-md"
								>
									<h2 className="font-semibold text-xl">{tool.name}</h2>
									<p className="text-muted-foreground text-sm">
										{tool.tagline}
									</p>
									<p className="mt-2 text-sm">{tool.description}</p>
									<div className="mt-2 flex gap-2">
										<span className="rounded bg-secondary px-2 py-1 text-xs">
											{tool.pricing}
										</span>
										{tool.featured && (
											<span className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs">
												Featured
											</span>
										)}
									</div>
								</div>
							))}
						</div>
						{hasNextPage && (
							<button
								type="button"
								onClick={() => fetchNextPage()}
								disabled={isFetchingNextPage}
								className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
							>
								{isFetchingNextPage ? "Loading more..." : "Load More"}
							</button>
						)}
					</>
				)}
			</div>
		</div>
	);
}
