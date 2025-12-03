"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderTree, Star, Tags, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/eden";

export function AdminStats() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["admin", "stats"],

		queryFn: async () => {
			const { data, error } = await api.v1.stats.get();
			if (error) throw error;
			return data;
		},
	});

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-16" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-destructive text-sm">
						Failed to load stats: {error.message}
					</p>
				</CardContent>
			</Card>
		);
	}

	const stats = [
		{
			title: "Total Tools",
			value: data?.totalTools ?? 0,
			icon: Wrench,
		},
		{
			title: "Categories",
			value: data?.totalCategories ?? 0,
			icon: FolderTree,
		},
		{
			title: "Tags",
			value: data?.totalTags ?? 0,
			icon: Tags,
		},
		{
			title: "Featured Tools",
			value: data?.featuredTools ?? 0,
			icon: Star,
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat) => (
				<Card key={stat.title}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">{stat.title}</CardTitle>
						<stat.icon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stat.value}</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
