"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface ToolStatCardProps {
	title: string;
	value: number | string;
}

export function ToolStatCard({ title, value }: ToolStatCardProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="font-normal text-muted-foreground text-sm">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value}</div>
			</CardContent>
		</Card>
	);
}
