"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@missingstack/api/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/drawer";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/lib/eden";

// Form schema
const categoryFormSchema = z.object({
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(120, "Slug must be 120 characters or less"),
	name: z
		.string()
		.min(1, "Name is required")
		.max(160, "Name must be 160 characters or less"),
	description: z.string().optional(),
	icon: z
		.string()
		.min(1, "Icon is required")
		.max(100, "Icon must be 100 characters or less"),
	parentId: z.string().uuid().optional().or(z.literal("")),
	weight: z.number().int().default(0),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

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
	const queryClient = useQueryClient();

	// Fetch category data
	const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
		queryKey: ["category", categoryId],
		queryFn: async () => {
			if (!categoryId) return null;
			const { data, error } = await api.v1.categories({ id: categoryId }).get();
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch category");
			return data as Category | null;
		},
		enabled: open && !!categoryId,
	});

	// Fetch default categories (top 10)
	const { data: categoriesData } = useQuery({
		queryKey: ["categories", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.categories.get({
				query: { limit: 10 },
			});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch categories");
			return data;
		},
	});

	const form = useForm({
		resolver: zodResolver(categoryFormSchema),
		defaultValues: {
			slug: "",
			name: "",
			description: "",
			icon: "",
			parentId: "",
			weight: 0,
		},
	});

	// Update form when category data is loaded
	useEffect(() => {
		if (categoryData) {
			form.reset({
				slug: categoryData.slug,
				name: categoryData.name,
				description: categoryData.description || "",
				icon: categoryData.icon,
				parentId: categoryData.parentId || "",
				weight: categoryData.weight ?? 0,
			});
		}
	}, [categoryData, form]);

	const onSubmit = async (data: CategoryFormValues) => {
		if (!categoryId) return;

		setIsSubmitting(true);
		try {
			const { error } = await api.v1.categories({ id: categoryId }).put({
				slug: data.slug,
				name: data.name,
				description: data.description || undefined,
				icon: data.icon,
				parentId: data.parentId || undefined,
				weight: data.weight,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to update category");
			}

			toast.success("Category updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
			queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update category",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const categoryOptions =
		categoriesData?.items
			.filter((cat) => cat.id !== categoryId) // Exclude current category from parent options
			.map((cat) => ({
				value: cat.id,
				label: cat.name,
			})) ?? [];

	// Search function for API-based searching
	const searchCategories = async (search: string) => {
		const { data, error } = await api.v1.categories.get({
			query: { search, limit: 10 },
		});
		if (error)
			throw new Error(error.value.message ?? "Failed to search categories");

		return (
			data?.items
				.filter((cat) => cat.id !== categoryId) // Exclude current category from parent options
				.map((cat) => ({
					value: cat.id,
					label: cat.name,
				})) ?? []
		);
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
										<Field>
											<FieldLabel htmlFor="name">Name *</FieldLabel>
											<Input
												id="name"
												{...form.register("name")}
												placeholder="Category name"
											/>
											<FieldError errors={[form.formState.errors.name]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="slug">Slug *</FieldLabel>
											<Input
												id="slug"
												{...form.register("slug")}
												placeholder="category-slug"
											/>
											<FieldError errors={[form.formState.errors.slug]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="description">Description</FieldLabel>
											<Textarea
												id="description"
												{...form.register("description")}
												placeholder="Category description"
												rows={4}
											/>
											<FieldError
												errors={[form.formState.errors.description]}
											/>
										</Field>

										<Field>
											<FieldLabel htmlFor="icon">Icon *</FieldLabel>
											<Input
												id="icon"
												{...form.register("icon")}
												placeholder="lucide icon name"
											/>
											<FieldError errors={[form.formState.errors.icon]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="parent">Parent Category</FieldLabel>
											<Combobox
												options={categoryOptions}
												selectedValues={
													form.watch("parentId")
														? [form.watch("parentId") as string]
														: []
												}
												onSelectedValuesChange={(values) =>
													form.setValue("parentId", values[0] || "")
												}
												placeholder="Select parent category (optional)"
												searchPlaceholder="Search categories..."
												searchFn={searchCategories}
												defaultLimit={10}
											/>
										</Field>

										<Field>
											<FieldLabel htmlFor="weight">Weight</FieldLabel>
											<Input
												id="weight"
												type="number"
												{...form.register("weight", {
													valueAsNumber: true,
												})}
												placeholder="0"
											/>
											<FieldError errors={[form.formState.errors.weight]} />
										</Field>
									</FieldGroup>
								</FieldSet>
							</FieldGroup>
						</div>

						<DrawerFooter className="shrink-0 border-t">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && (
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
