"use client";

import type { ToolAffiliateLink } from "@missingstack/api/features/affiliate-links";
import { Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";
import { formatCommissionRate, formatRevenue } from "./shared/formatting";

interface AffiliateLinksTableRowProps {
	affiliateLink: ToolAffiliateLink;
	toolName: string;
	onClick: () => void;
	onDelete: (affiliateLink: { id: string; toolId: string }) => void;
}

export function AffiliateLinksTableRow({
	affiliateLink,
	toolName,
	onClick,
	onDelete,
}: AffiliateLinksTableRowProps) {
	return (
		<TableRow onClick={onClick} className="cursor-pointer">
			<TableCell className="font-medium">{toolName}</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				<div className="max-w-[300px] truncate">
					{affiliateLink.affiliateUrl}
				</div>
			</TableCell>
			<TableCell>
				{affiliateLink.isPrimary ? (
					<Badge variant="default">Primary</Badge>
				) : (
					<span className="text-muted-foreground text-sm">No</span>
				)}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{formatCommissionRate(affiliateLink.commissionRate)}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{affiliateLink.clickCount ?? 0}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{formatRevenue(affiliateLink.revenueTracked)}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{new Date(affiliateLink.createdAt).toLocaleDateString()}
			</TableCell>
			<TableCell onClick={(e) => e.stopPropagation()}>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						onDelete({
							id: affiliateLink.id,
							toolId: affiliateLink.toolId,
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
