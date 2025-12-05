"use client";

import type { Category } from "@missingstack/api/types";
import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";

interface CategoriesTableRowProps {
	category: Category;
	onClick: () => void;
	onDelete: (category: { id: string; name: string }) => void;
}

export function CategoriesTableRow({
	category,
	onClick,
	onDelete,
}: CategoriesTableRowProps) {
	return (
		<TableRow onClick={onClick} className="cursor-pointer">
			<TableCell className="font-medium">{category.name}</TableCell>
			<TableCell className="font-mono text-muted-foreground text-sm">
				{category.slug}
			</TableCell>
			<TableCell>{category.weight}</TableCell>
			<TableCell className="text-muted-foreground text-sm">
				{new Date(category.createdAt).toLocaleDateString()}
			</TableCell>
			<TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
				{category.description || "-"}
			</TableCell>
			<TableCell className="font-mono text-muted-foreground text-xs">
				{category.icon}
			</TableCell>
			<TableCell onClick={(e) => e.stopPropagation()}>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onDelete({ id: category.id, name: category.name })}
					className="text-destructive hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</TableCell>
		</TableRow>
	);
}
