"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/drawer";
import { FieldGroup, FieldSet } from "~/components/ui/field";
import { useTag, useUpdateTag } from "~/hooks/tags";
import { TagBasicFields, TagTypeColorFields } from "./fields";
import {
	type TagFormValues,
	defaultTagFormValues,
	tagFormSchema,
} from "./shared/tag-form-schema";

interface EditTagFormProps {
	tagId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditTagForm({ tagId, open, onOpenChange }: EditTagFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: tagData, isLoading: isLoadingTag } = useTag(tagId);
	const updateMutation = useUpdateTag(tagId);

	const form = useForm<TagFormValues>({
		resolver: zodResolver(tagFormSchema),
		defaultValues: defaultTagFormValues,
	});

	useEffect(() => {
		if (!open) {
			form.reset(defaultTagFormValues);
		}
	}, [open, form]);

	useEffect(() => {
		if (tagData && open) {
			form.reset({
				slug: tagData.slug,
				name: tagData.name,
				type: tagData.type,
				color: tagData.color || "default",
			});
		}
	}, [tagData, open, form]);

	const onSubmit = async (data: TagFormValues) => {
		if (!tagId) return;

		setIsSubmitting(true);
		try {
			await updateMutation.mutateAsync(
				{
					slug: data.slug,
					name: data.name,
					type: data.type,
					color: data.color,
				},
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				},
			);
		} catch (_error) {
			// Error is handled by the mutation hook
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:max-w-lg! sm:data-[vaul-drawer-direction=right]:max-w-lg!">
				<DrawerHeader className="shrink-0 border-b">
					<DrawerTitle>Tag Details</DrawerTitle>
					<DrawerDescription>
						View and edit tag information. All fields are editable.
					</DrawerDescription>
				</DrawerHeader>

				{isLoadingTag ? (
					<div className="flex flex-1 items-center justify-center">
						<div className="flex flex-col items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="text-muted-foreground text-sm">
								Loading tag details...
							</span>
						</div>
					</div>
				) : (
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex min-h-0 flex-1 flex-col"
					>
						<div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
							<FieldGroup>
								<FieldSet>
									<FieldGroup>
										<TagBasicFields form={form} />
										<TagTypeColorFields form={form} />
									</FieldGroup>
								</FieldSet>
							</FieldGroup>
						</div>

						<DrawerFooter className="shrink-0 border-t">
							<Button
								type="submit"
								disabled={isSubmitting || updateMutation.isPending}
							>
								{(isSubmitting || updateMutation.isPending) && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Update Tag
							</Button>
							<DrawerClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</form>
				)}
			</DrawerContent>
		</Drawer>
	);
}
