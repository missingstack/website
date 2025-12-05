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
import { useCategory, useUpdateCategory } from "~/hooks/categories";
import {
	CategoryBasicFields,
	CategoryParentField,
	CategoryWeightField,
} from "./fields";
import {
	type CategoryFormValues,
	categoryFormSchema,
	defaultCategoryFormValues,
} from "./shared/category-form-schema";

interface EditCategoryFormProps {
	categoryId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditCategoryForm({
	categoryId,
	open,
	onOpenChange,
}: EditCategoryFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: categoryData, isLoading: isLoadingCategory } =
		useCategory(categoryId);
	const updateMutation = useUpdateCategory(categoryId);

	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categoryFormSchema),
		defaultValues: defaultCategoryFormValues,
	});

	useEffect(() => {
		if (!open) {
			form.reset(defaultCategoryFormValues);
		}
	}, [open, form]);

	useEffect(() => {
		if (categoryData && open) {
			form.reset({
				slug: categoryData.slug,
				name: categoryData.name,
				description: categoryData.description || "",
				icon: categoryData.icon,
				parentId: categoryData.parentId || "",
				weight: categoryData.weight ?? 0,
			});
		}
	}, [categoryData, open, form]);

	const onSubmit = async (data: CategoryFormValues) => {
		if (!categoryId) return;

		setIsSubmitting(true);
		try {
			await updateMutation.mutateAsync(
				{
					slug: data.slug,
					name: data.name,
					description: data.description || undefined,
					icon: data.icon,
					parentId: data.parentId || undefined,
					weight: data.weight,
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
					<DrawerTitle>Category Details</DrawerTitle>
					<DrawerDescription>
						View and edit category information. All fields are editable.
					</DrawerDescription>
				</DrawerHeader>

				{isLoadingCategory ? (
					<div className="flex flex-1 items-center justify-center">
						<div className="flex flex-col items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="text-muted-foreground text-sm">
								Loading category details...
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
										<CategoryBasicFields form={form} />
										<CategoryParentField
											form={form}
											excludeCategoryId={categoryId}
										/>
										<CategoryWeightField form={form} />
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
								Update Category
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
