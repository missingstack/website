"use client";

import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

interface CategoryDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categoryName?: string;
	isDeleting?: boolean;
	onConfirm: () => void;
}

export function CategoryDeleteDialog({
	open,
	onOpenChange,
	categoryName,
	isDeleting = false,
	onConfirm,
}: CategoryDeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Category</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{categoryName}"? This action cannot
						be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
