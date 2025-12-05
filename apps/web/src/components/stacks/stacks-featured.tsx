"use client";

import type { StackWithCount, ToolData } from "@missingstack/api/types";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getIcon } from "~/lib/icons";

interface StacksFeaturedProps {
	stacks: { stack: StackWithCount; tools: ToolData[] }[];
	hasSearchQuery: boolean;
}

export function StacksFeatured({
	stacks,
	hasSearchQuery,
}: StacksFeaturedProps) {
	if (stacks.length === 0) return null;

	return (
		<section className="mx-auto mb-12 max-w-7xl px-4 sm:mb-16 sm:px-6 lg:mb-20">
			<div className="mb-6 flex items-center justify-between sm:mb-8">
				<h2 className="flex items-center gap-2 text-primary text-xl sm:text-2xl">
					<Sparkles className="h-4 w-4 text-yellow-500 sm:h-5 sm:w-5" />
					<span>
						{hasSearchQuery ? "Matching Stacks" : "Featured Technology Stacks"}
					</span>
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
				{stacks.map(({ stack, tools }) => {
					const Icon = stack.icon ? getIcon(stack.icon) : null;
					return (
						<Link
							key={stack.id}
							href={`/stacks/${stack.slug}`}
							className="group hover:-translate-y-1 relative rounded-xl border border-border/50 bg-white p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg active:scale-[0.98] sm:rounded-2xl sm:p-6"
						>
							<div className="mb-4 flex items-start justify-between">
								<div className="flex min-w-0 items-center gap-3 sm:gap-4">
									{Icon && (
										<div className="rounded-lg bg-secondary/80 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10 sm:rounded-xl sm:p-3">
											<Icon className="h-5 w-5 text-primary transition-colors duration-200 sm:h-6 sm:w-6" />
										</div>
									)}
									<div className="min-w-0 flex-1">
										<h3 className="font-semibold text-base text-primary transition-colors duration-200 group-hover:text-blue-600 sm:text-lg">
											{stack.name}
										</h3>
										<p className="line-clamp-1 text-muted-foreground text-xs sm:text-sm">
											{stack.description}
										</p>
									</div>
								</div>
								<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary sm:h-5 sm:w-5" />
							</div>

							<div className="flex items-center gap-3 border-border/50 border-t pt-3 sm:pt-4">
								<div className="-space-x-2 flex">
									{tools.slice(0, 4).map((tool) => (
										<div
											key={tool.id}
											className="relative h-7 w-7 overflow-hidden rounded-lg border-2 border-white bg-secondary transition-transform duration-200 group-hover:scale-110 sm:h-8 sm:w-8"
										>
											<Image
												src={tool.logo}
												alt={tool.name}
												fill
												className="object-cover"
												sizes="32px"
												unoptimized
											/>
										</div>
									))}
								</div>
								<span className="text-muted-foreground text-xs sm:text-sm">
									{stack.toolCount} tools
								</span>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
