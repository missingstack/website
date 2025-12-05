"use client";

import type {
	Category,
	CategoryWithCount,
	Tool,
	ToolQueryOptions,
} from "@missingstack/api/types";
import {
	ArrowRight,
	ArrowRight as ArrowRightIcon,
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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useRef } from "react";
import { Button } from "~/components/ui/button";
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
import { getIcon } from "~/lib/icons";

// CategoryNavigation Component
interface CategoryNavigationProps {
	categories: CategoryWithCount[];
}

export function CategoryNavigation({ categories }: CategoryNavigationProps) {
	const pathname = usePathname();

	return (
		<div className="flex items-center gap-3 sm:gap-4">
			<nav className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto px-1 py-2 sm:gap-3 sm:py-2.5">
				{categories.map((cat) => {
					const Icon = getIcon(cat.icon);
					const isActive = pathname === `/categories/${cat.slug}`;

					return (
						<Link
							key={cat.id}
							href={`/categories/${cat.slug}`}
							className={`group flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-medium text-xs transition-all duration-200 active:scale-95 sm:gap-2 sm:px-3.5 sm:text-sm ${
								isActive
									? "bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg"
									: "text-muted-foreground hover:bg-secondary/80 hover:text-primary"
							}`}
						>
							<Icon
								className={`h-3.5 w-3.5 transition-opacity duration-200 sm:h-4 sm:w-4 ${
									isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
								}`}
							/>
							<span>{cat.name}</span>
							<span
								className={`rounded-md px-1.5 py-0.5 font-normal text-[10px] transition-colors duration-200 sm:text-xs ${
									isActive
										? "bg-white/20 text-white"
										: "bg-secondary text-muted-foreground/70"
								}`}
							>
								{cat.toolCount}
							</span>
						</Link>
					);
				})}
			</nav>

			<div className="shrink-0 pl-2 sm:pl-3">
				<Link
					href="/categories"
					className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-2 py-2 font-medium text-primary text-xs transition-all duration-200 hover:bg-primary/5 active:scale-95 active:bg-primary/10 sm:px-3.5 sm:text-sm"
				>
					<span className="hidden sm:inline">View All</span>
					<span className="sm:hidden">All</span>
					<ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
				</Link>
			</div>
		</div>
	);
}

// GlobalSearch Component
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
											<ArrowRightIcon className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
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
												<ArrowRightIcon className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
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

// HeaderContent Component
interface HeaderContentProps {
	categories: CategoryWithCount[];
	stats: { totalTools: number; totalCategories: number };
	topCategories: CategoryWithCount[];
}

export function HeaderContent({
	categories,
	stats,
	topCategories,
}: HeaderContentProps) {
	const searchRef = useRef<{ open: () => void }>(null);

	return (
		<header className="sticky top-0 z-50 w-full border-border/50 border-b bg-white/80 backdrop-blur-lg transition-shadow duration-300">
			<div className="relative mx-auto w-screen max-w-7xl px-4 sm:px-6">
				<div className="flex h-14 items-center justify-between gap-3 py-2 sm:h-16 sm:gap-4 sm:py-3">
					<Link
						href="/"
						className="group flex items-center gap-2 transition-transform duration-200 active:scale-95 sm:gap-2.5"
					>
						<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-bold text-lg text-white italic shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md sm:h-9 sm:w-9 sm:text-xl">
							M
						</div>
						<span className="font-semibold text-base tracking-tight sm:text-lg">
							Missing stack
						</span>
					</Link>

					<div className="hidden md:block">
						<GlobalSearch
							ref={searchRef}
							initialCategories={categories}
							totalTools={stats.totalTools}
							hideMobileTrigger={true}
						/>
					</div>

					<div className="flex items-center gap-2 sm:gap-3">
						<button
							type="button"
							onClick={() => searchRef.current?.open()}
							className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-muted-foreground transition-all duration-200 hover:bg-secondary/50 hover:text-foreground active:scale-95 md:hidden"
							aria-label="Search"
						>
							<Search className="h-5 w-5" />
						</button>
						<Button
							size="sm"
							className="rounded-full px-4 text-xs transition-all duration-300 hover:scale-105 active:scale-95 sm:px-5 sm:text-sm"
							asChild
						>
							<Link href="/advertise">Advertise</Link>
						</Button>
					</div>
				</div>

				<CategoryNavigation categories={topCategories} />

				<div className="pointer-events-none absolute opacity-0 md:hidden">
					<GlobalSearch
						ref={searchRef}
						initialCategories={categories}
						totalTools={stats.totalTools}
						hideMobileTrigger={true}
					/>
				</div>
			</div>
		</header>
	);
}
