"use client";

import type { ToolSponsorship } from "@missingstack/api/types";
import { Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";

interface SponsorshipsTableRowProps {
	sponsorship: ToolSponsorship;
	toolName: string;
	onClick: () => void;
	onDelete: (sponsorship: { id: string; toolId: string }) => void;
	getTierBadgeVariant: (
		tier: string,
	) => "default" | "blue" | "secondary" | "outline";
	getPaymentStatusBadgeVariant: (
		status: string,
	) => "default" | "secondary" | "destructive" | "outline";
}

export function SponsorshipsTableRow({
	sponsorship,
	toolName,
	onClick,
	onDelete,
	getTierBadgeVariant,
	getPaymentStatusBadgeVariant,
}: SponsorshipsTableRowProps) {
	return (
		<TableRow onClick={onClick} className="cursor-pointer">
			<TableCell className="font-medium">{toolName}</TableCell>
			<TableCell>
				<Badge variant={getTierBadgeVariant(sponsorship.tier)}>
					{sponsorship.tier}
				</Badge>
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{new Date(sponsorship.startDate).toLocaleDateString()}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{new Date(sponsorship.endDate).toLocaleDateString()}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{sponsorship.priorityWeight}
			</TableCell>
			<TableCell>
				<Badge
					variant={getPaymentStatusBadgeVariant(sponsorship.paymentStatus)}
				>
					{sponsorship.paymentStatus}
				</Badge>
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{sponsorship.isActive ? "Yes" : "No"}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{new Date(sponsorship.createdAt).toLocaleDateString()}
			</TableCell>
			<TableCell onClick={(e) => e.stopPropagation()}>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						onDelete({
							id: sponsorship.id,
							toolId: sponsorship.toolId,
						})
					}
					className="text-destructive hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</TableCell>
		</TableRow>
	);
}
