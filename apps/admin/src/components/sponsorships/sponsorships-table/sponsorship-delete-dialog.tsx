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

interface SponsorshipDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	toolName?: string;
	isDeleting?: boolean;
	onConfirm: () => void;
}

export function SponsorshipDeleteDialog({
	open,
	onOpenChange,
	toolName,
	isDeleting = false,
	onConfirm,
}: SponsorshipDeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Sponsorship</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the sponsorship for "{toolName}"?
						This action cannot be undone.
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
