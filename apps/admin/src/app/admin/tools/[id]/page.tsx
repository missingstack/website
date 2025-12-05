"use client";

import type { ToolData } from "@missingstack/api/types";
import { useQuery } from "@tanstack/react-query";
import { FileText, FolderTree, Layers, Link2, List, Tag } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ToolDetailContent } from "~/components/tools/tool-detail/tool-detail-content";

import { EditToolForm } from "~/components/tools/tool-form/edit-tool-form";
import { Badge } from "~/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/lib/eden";
import { formatPricingDisplay } from "~/lib/utils";

const tabs = [
	{
		name: "Overview",
		value: "overview",
		icon: List,
	},
	{
		name: "Details",
		value: "details",
		icon: FileText,
	},
	{
		name: "Categories",
		value: "categories",
		icon: FolderTree,
	},
	{
		name: "Tags",
		value: "tags",
		icon: Tag,
	},
	{
		name: "Stacks",
		value: "stacks",
		icon: Layers,
	},
	{
		name: "Alternatives",
		value: "alternatives",
		icon: Link2,
	},
];

function ToolDetailPageSkeleton() {
	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="space-y-2">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-96" />
			</div>
			<Separator />
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		</div>
	);
}

function ToolDetailPageContent() {
	const params = useParams();
	const router = useRouter();
	const toolId = params.id as string;
	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("overview");
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

	const {
		data: tool,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["tool", toolId],
		queryFn: async () => {
			const { data, error } = await api.v1.tools({ id: toolId }).get();
			if (error) throw new Error(error.value.message ?? "Failed to fetch tool");
			return data as ToolData | null;
		},
		enabled: !!toolId,
	});

	const updateUnderlinePosition = () => {
		const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
		const activeTabElement = tabRefs.current[activeIndex];

		if (activeTabElement) {
			const { offsetLeft, offsetWidth } = activeTabElement;

			setUnderlineStyle({
				left: offsetLeft,
				width: offsetWidth,
			});
		}
	};

	useLayoutEffect(() => {
		updateUnderlinePosition();
	}, [activeTab]);

	useEffect(() => {
		if (!isLoading && tool) {
			requestAnimationFrame(() => {
				updateUnderlinePosition();
			});
		}
	}, [isLoading, tool, activeTab]);

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col gap-4">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
				<Separator />
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		);
	}

	if (error || !tool) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4">
				<p className="text-destructive text-lg">
					{error instanceof Error ? error.message : "Tool not found"}
				</p>
				<Button onClick={() => router.push("/admin/tools")} variant="outline">
					Back to Tools
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex flex-col gap-8">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/admin">Workspace</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/admin/tools">Tools</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{tool.name}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-4">
						{tool.logo && (
							<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
								<Image
									src={tool.logo}
									alt={tool.name}
									fill
									className="object-contain p-2"
								/>
							</div>
						)}
						<div className="space-y-2">
							<div>
								<h1 className="font-bold text-3xl tracking-tight">
									{tool.name}
								</h1>
								{tool.tagline && (
									<p className="mt-1 text-muted-foreground text-sm">
										{tool.tagline}
									</p>
								)}
							</div>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline">
									{formatPricingDisplay(tool.pricing)}
								</Badge>
								{tool.license && (
									<Badge variant="outline">{tool.license}</Badge>
								)}
								{tool.featured && <Badge variant="default">Featured</Badge>}
								{tool.isSponsored && <Badge variant="default">Sponsored</Badge>}
							</div>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsEditDrawerOpen(true)}
					>
						Edit Tool
					</Button>
				</div>
			</div>

			<Tabs
				defaultValue="overview"
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex flex-1 flex-col"
			>
				<TabsList
					className="relative inline-flex w-full justify-start gap-0 rounded-none border-b bg-background p-0"
					role="tablist"
				>
					{tabs.map((tab, index) => {
						return (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								ref={(el) => {
									tabRefs.current[index] = el;
								}}
								className="relative z-10 flex-none rounded-none border-0 bg-background px-3 py-2 text-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-background"
							>
								{tab.name}
							</TabsTrigger>
						);
					})}

					<motion.div
						className="absolute bottom-0 z-20 h-[2px] bg-foreground"
						layoutId="underline"
						style={{
							left: underlineStyle.left,
							width: underlineStyle.width,
						}}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 40,
						}}
					/>
				</TabsList>

				<TabsContent value="overview" className="flex-1 pt-4">
					<div className="max-w-4xl">
						<ToolDetailContent tool={tool} view="overview" />
					</div>
				</TabsContent>

				<TabsContent value="details" className="flex-1 pt-4">
					<div className="max-w-4xl">
						<ToolDetailContent tool={tool} view="details" />
					</div>
				</TabsContent>

				<TabsContent value="categories" className="flex-1 pt-4">
					<div className="max-w-4xl">
						<ToolDetailContent tool={tool} view="categories" />
					</div>
				</TabsContent>

				<TabsContent value="tags" className="flex-1 pt-4">
					<div className="max-w-4xl">
						<ToolDetailContent tool={tool} view="tags" />
					</div>
				</TabsContent>

				<TabsContent value="stacks" className="flex-1 pt-4">
					<div className="max-w-4xl">
						<ToolDetailContent tool={tool} view="stacks" />
					</div>
				</TabsContent>

				<TabsContent value="alternatives" className="flex-1 pt-4">
					<div className="max-w-4xl">
						<ToolDetailContent tool={tool} view="alternatives" />
					</div>
				</TabsContent>
			</Tabs>

			<EditToolForm
				toolId={toolId}
				open={isEditDrawerOpen}
				onOpenChange={setIsEditDrawerOpen}
			/>
		</div>
	);
}

export default function ToolDetailPage() {
	return (
		<Suspense fallback={<ToolDetailPageSkeleton />}>
			<ToolDetailPageContent />
		</Suspense>
	);
}
