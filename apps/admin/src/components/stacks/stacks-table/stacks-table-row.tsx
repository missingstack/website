"use client";

import type { Stack } from "@missingstack/api/types";
import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";

interface StacksTableRowProps {
	stack: Stack;
	onClick: () => void;
	onDelete: (stack: { id: string; name: string }) => void;
}

export function StacksTableRow({
	stack,
	onClick,
	onDelete,
}: StacksTableRowProps) {
	return (
		<TableRow onClick={onClick} className="cursor-pointer">
			<TableCell className="font-medium">{stack.name}</TableCell>
			<TableCell className="font-mono text-muted-foreground text-sm">
				{stack.slug}
			</TableCell>
			<TableCell>{stack.weight ?? 0}</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{new Date(stack.createdAt).toLocaleDateString()}
			</TableCell>
			<TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
				{stack.description || "-"}
			</TableCell>
			<TableCell className="font-mono text-muted-foreground text-xs">
				{stack.icon || "-"}
			</TableCell>
			<TableCell onClick={(e) => e.stopPropagation()}>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onDelete({ id: stack.id, name: stack.name })}
					className="text-destructive hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</TableCell>
		</TableRow>
	);
}
