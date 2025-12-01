"use client";

import type { Category, Tool, ToolQueryOptions } from "@missingstack/api/types";
import {
	ArrowRight,
	Clock,
	Folder,
	Loader2,
	Search,
	Sparkles,
	TrendingUp,
	Wrench,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "~/components/ui/command";
import { api } from "~/lib/eden";

interface GlobalSearchProps {
	initialCategories: Category[];
	totalTools: number;
	hideMobileTrigger?: boolean;
}

interface SearchResults {
	tools: Tool[];
	categories: Category[];
}

const DEBOUNCE_MS = 300;
const MAX_RECENT = 3;
const RECENT_KEY = "recentSearches";

export const GlobalSearch = React.forwardRef<
	{ open: () => void },
	GlobalSearchProps
>(({ initialCategories, totalTools, hideMobileTrigger = false }, ref) => {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);

	React.useImperativeHandle(ref, () => ({
		open: () => setOpen(true),
	}));
	const [query, setQuery] = React.useState("");
	const [results, setResults] = React.useState<SearchResults>({
		tools: [],
		categories: [],
	});
	const [isSearching, setIsSearching] = React.useState(false);
	const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

	const abortControllerRef = React.useRef<AbortController | null>(null);
	const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	const filterCategories = React.useCallback(
		(searchQuery: string) => {
			const lower = searchQuery.toLowerCase();
			return initialCategories
				.filter(
					(cat) =>
						cat.name.toLowerCase().includes(lower) ||
						cat.description?.toLowerCase().includes(lower),
				)
				.slice(0, 4);
		},
		[initialCategories],
	);

	React.useEffect(() => {
		try {
			const stored = localStorage.getItem(RECENT_KEY);
			if (stored) setRecentSearches(JSON.parse(stored));
		} catch {}
	}, []);

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	React.useEffect(() => {
		const trimmed = query.trim();

		if (!trimmed) {
			setIsSearching(false);
			setResults({ tools: [], categories: [] });
			return;
		}

		abortControllerRef.current?.abort();
		clearTimeout(timeoutRef.current);
		setIsSearching(true);

		timeoutRef.current = setTimeout(async () => {
			const controller = new AbortController();
			abortControllerRef.current = controller;

			try {
				// Build query options for the tools endpoint
				const queryOptions: Partial<ToolQueryOptions> = {
					search: trimmed,
					limit: 5,
				};

				const { data } = await api.v1.tools.get({
					query: queryOptions as ToolQueryOptions,
				});

				if (!controller.signal.aborted) {
					setResults({
						tools: data?.items || [],
						categories: filterCategories(trimmed),
					});
					setIsSearching(false);
				}
			} catch (err) {
				if (!controller.signal.aborted) {
					if (err instanceof Error && err.name !== "AbortError") {
						console.error("Search error:", err);
					}
					setIsSearching(false);
				}
			}
		}, DEBOUNCE_MS);

		return () => {
			clearTimeout(timeoutRef.current);
			abortControllerRef.current?.abort();
		};
	}, [query, filterCategories]);

	const saveRecent = React.useCallback((search: string) => {
		if (!search.trim()) return;
		setRecentSearches((prev) => {
			const updated = [search, ...prev.filter((s) => s !== search)].slice(
				0,
				MAX_RECENT,
			);
			localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
			return updated;
		});
	}, []);

	const handleSelect = React.useCallback(
		(type: "tool" | "category", slug: string) => {
			saveRecent(query);
			setOpen(false);
			setQuery("");
			router.push(type === "tool" ? `/tools/${slug}` : `/categories/${slug}`);
		},
		[query, router, saveRecent],
	);

	const handleQuickAction = React.useCallback(
		(action: string) => {
			setOpen(false);
			setQuery("");
			const routes: Record<string, Route> = {
				discover: "/discover",
				categories: "/categories",
				submit: "/advertise",
			};
			const route = routes[action];
			if (route) router.push(route);
		},
		[router],
	);

	const resetDialog = React.useCallback(() => {
		setQuery("");
		setResults({ tools: [], categories: [] });
		setIsSearching(false);
		abortControllerRef.current?.abort();
		clearTimeout(timeoutRef.current);
	}, []);

	const hasResults = results.tools.length > 0 || results.categories.length > 0;
	const showQuery = query.trim();
	const showSuggestions = !showQuery && !isSearching;

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="group relative hidden h-10 w-96 items-center gap-3 rounded-xl border border-border/50 bg-secondary/50 pr-3 pl-3.5 text-sm transition-all hover:border-border hover:bg-secondary/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 md:flex"
			>
				<Search className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground/70" />
				<span className="text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
					Search {totalTools} tools...
				</span>
				<kbd className="ml-auto hidden h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground lg:inline-flex">
					<span className="text-xs">⌘</span>K
				</kbd>
			</button>

			{!hideMobileTrigger && (
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
					aria-label="Search"
				>
					<Search className="h-5 w-5" />
				</button>
			)}

			<CommandDialog
				open={open}
				onOpenChange={(newOpen) => {
					setOpen(newOpen);
					if (!newOpen) resetDialog();
				}}
				title="Search Missing Stack"
				description="Search for tools, categories, and more"
			>
				<div className="relative">
					<CommandInput
						placeholder="Search tools, categories..."
						value={query}
						onValueChange={setQuery}
						className={
							isSearching
								? "[&_[data-slot=command-input-wrapper]_svg]:hidden"
								: ""
						}
					/>
					{isSearching && (
						<div className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 z-10">
							<Loader2 className="size-4 animate-spin text-primary opacity-50" />
						</div>
					)}
				</div>

				<CommandList scrollAreaClassName="h-[300px]">
					{/* Recent Searches */}
					{recentSearches.length > 0 && (
						<CommandGroup heading="Recent Searches">
							{recentSearches.map((search) => (
								<CommandItem
									key={search}
									value={`recent-${search}`}
									onSelect={() => {
										setQuery(search);
										saveRecent(search);
									}}
									className="flex items-center gap-3"
								>
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span>{search}</span>
								</CommandItem>
							))}
						</CommandGroup>
					)}

					{recentSearches.length > 0 && <CommandSeparator />}
					<CommandGroup heading="Quick Actions">
						<CommandItem
							value="discover-all-tools"
							onSelect={() => handleQuickAction("discover")}
							className="flex items-center gap-3"
						>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
							<span>Discover all tools</span>
						</CommandItem>
						<CommandItem
							value="browse-categories"
							onSelect={() => handleQuickAction("categories")}
							className="flex items-center gap-3"
						>
							<Folder className="h-4 w-4 text-muted-foreground" />
							<span>Browse categories</span>
						</CommandItem>
						<CommandItem
							value="submit-tool"
							onSelect={() => handleQuickAction("submit")}
							className="flex items-center gap-3"
						>
							<Sparkles className="h-4 w-4 text-muted-foreground" />
							<span>Advertise</span>
						</CommandItem>
					</CommandGroup>

					{/* Search Results */}
					{showQuery && hasResults && (
						<>
							<CommandSeparator />
							{results.tools.length > 0 && (
								<CommandGroup heading="Tools">
									{results.tools.map((tool) => (
										<CommandItem
											key={tool.id}
											value={`tool-${tool.slug}`}
											onSelect={() => handleSelect("tool", tool.slug)}
											className="flex items-center gap-3 py-3"
										>
											<div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-secondary/80">
												{tool.logo ? (
													<Image
														src={tool.logo}
														alt={tool.name}
														fill
														className="object-cover"
														sizes="32px"
														unoptimized
													/>
												) : (
													<Wrench className="h-4 w-4 text-muted-foreground" />
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium">{tool.name}</p>
												<p className="truncate text-muted-foreground text-xs">
													{tool.tagline}
												</p>
											</div>
											<ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
										</CommandItem>
									))}
								</CommandGroup>
							)}

							{results.categories.length > 0 && (
								<>
									{results.tools.length > 0 && <CommandSeparator />}
									<CommandGroup heading="Categories">
										{results.categories.map((cat) => (
											<CommandItem
												key={cat.id}
												value={`category-${cat.slug}`}
												onSelect={() => handleSelect("category", cat.slug)}
												className="flex items-center gap-3 py-3"
											>
												<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
													<Folder className="h-4 w-4 text-primary" />
												</div>
												<div className="min-w-0 flex-1">
													<p className="font-medium">{cat.name}</p>
													{cat.description && (
														<p className="truncate text-muted-foreground text-xs">
															{cat.description}
														</p>
													)}
												</div>
												<ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
											</CommandItem>
										))}
									</CommandGroup>
								</>
							)}

							<CommandSeparator />
							<CommandGroup>
								<CommandItem
									value="see-all-results"
									onSelect={() => {
										setOpen(false);
										router.push(`/discover?q=${encodeURIComponent(query)}`);
									}}
									className="justify-center text-primary"
								>
									<Search className="mr-2 h-4 w-4" />
									See all results for "{query}"
								</CommandItem>
							</CommandGroup>
						</>
					)}

					{showQuery && !hasResults && isSearching && (
						<>
							<CommandSeparator />
							<div className="flex flex-col items-center justify-center gap-2 py-8">
								<Loader2 className="h-5 w-5 animate-spin text-primary" />
								<p className="text-muted-foreground text-sm">Searching...</p>
							</div>
						</>
					)}

					{showQuery && !hasResults && !isSearching && (
						<>
							<CommandSeparator />
							<CommandEmpty>
								<div className="flex flex-col items-center gap-2 py-4">
									<Search className="h-8 w-8 text-muted-foreground/50" />
									<p>No results found for "{query}"</p>
									<p className="text-muted-foreground text-xs">
										Try a different search term
									</p>
								</div>
							</CommandEmpty>
						</>
					)}

					{showSuggestions && (
						<>
							<CommandSeparator />
							<CommandGroup heading="Popular Categories">
								{initialCategories.slice(0, 5).map((cat) => (
									<CommandItem
										key={cat.id}
										value={`popular-${cat.slug}`}
										onSelect={() => handleSelect("category", cat.slug)}
										className="flex items-center gap-3"
									>
										<Folder className="h-4 w-4 text-muted-foreground" />
										<span>{cat.name}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</>
					)}
				</CommandList>
			</CommandDialog>
		</>
	);
});

GlobalSearch.displayName = "GlobalSearch";
