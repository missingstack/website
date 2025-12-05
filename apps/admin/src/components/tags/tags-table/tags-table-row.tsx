"use client";

import type { Tag } from "@missingstack/api/types";
import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";

interface TagsTableRowProps {
	tag: Tag;
	onClick: () => void;
	onDelete: (tag: { id: string; name: string }) => void;
}

export function TagsTableRow({ tag, onClick, onDelete }: TagsTableRowProps) {
	return (
		<TableRow onClick={onClick} className="cursor-pointer">
			<TableCell className="font-medium">{tag.name}</TableCell>
			<TableCell className="font-mono text-muted-foreground text-sm">
				{tag.slug}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{tag.type}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{tag.color || "default"}
			</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{new Date(tag.createdAt).toLocaleDateString()}
			</TableCell>
			<TableCell onClick={(e) => e.stopPropagation()}>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onDelete({ id: tag.id, name: tag.name })}
					className="text-destructive hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</TableCell>
		</TableRow>
	);
}
