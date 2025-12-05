"use client";

import { Card, CardContent } from "~/components/ui/card";

interface EmptyStateCardProps {
	message: string;
}

export function EmptyStateCard({ message }: EmptyStateCardProps) {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center py-12">
				<p className="text-muted-foreground text-sm">{message}</p>
			</CardContent>
		</Card>
	);
}
