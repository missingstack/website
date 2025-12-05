"use client";

import type { ToolWithSponsorship } from "@missingstack/api/types";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";

interface ToolsTableRowProps {
	tool: ToolWithSponsorship;
	onDelete: (tool: { id: string; name: string }) => void;
}

export function ToolsTableRow({ tool, onDelete }: ToolsTableRowProps) {
	return (
		<TableRow>
			<TableCell className="font-medium">
				<Link href={`/admin/tools/${tool.id}`} className="hover:underline">
					{tool.name}
				</Link>
			</TableCell>
			<TableCell className="font-mono text-muted-foreground text-sm">
				{tool.slug}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{new Date(tool.createdAt).toLocaleDateString()}
			</TableCell>
			<TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
				{tool.description || "-"}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{tool.website ? (
					<a
						href={tool.website}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline"
					>
						{tool.website}
					</a>
				) : (
					"-"
				)}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{tool.featured ? "Yes" : "No"}
			</TableCell>
			<TableCell onClick={(e) => e.stopPropagation()}>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onDelete({ id: tool.id, name: tool.name })}
					className="text-destructive hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</TableCell>
		</TableRow>
	);
}
