"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Tag } from "@missingstack/api/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { api } from "~/lib/eden";

// Tag type enum values
const tagTypeOptions = [
	"pricing",
	"platform",
	"compliance",
	"deployment",
	"stage",
	"feature",
] as const;

// Badge variant enum values
const badgeVariantOptions = [
	"default",
	"blue",
	"green",
	"purple",
	"gold",
	"secondary",
	"outline",
] as const;

// Form schema
const tagFormSchema = z.object({
	slug: z.string().min(1, "Slug is required"),
	name: z.string().min(1, "Name is required"),
	type: z.enum(tagTypeOptions),
	color: z.enum(badgeVariantOptions).default("default"),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

interface EditTagFormProps {
	tagId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditTagForm({ tagId, open, onOpenChange }: EditTagFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const queryClient = useQueryClient();

	// Fetch tag data
	const { data: tagData, isLoading: isLoadingTag } = useQuery({
		queryKey: ["tag", tagId],
		queryFn: async () => {
			if (!tagId) return null;
			const { data, error } = await api.v1.tags({ id: tagId }).get();
			if (error) throw new Error(error.value.message ?? "Failed to fetch tag");
			return data as Tag | null;
		},
		enabled: open && !!tagId,
	});

	const form = useForm({
		resolver: zodResolver(tagFormSchema),
		defaultValues: {
			slug: "",
			name: "",
			type: "feature" as const,
			color: "default" as const,
		},
	});

	// Update form when tag data is loaded
	useEffect(() => {
		if (tagData) {
			form.reset({
				slug: tagData.slug,
				name: tagData.name,
				type: tagData.type,
				color: tagData.color || "default",
			});
		}
	}, [tagData, form]);

	const onSubmit = async (data: TagFormValues) => {
		if (!tagId) return;

		setIsSubmitting(true);
		try {
			const { error } = await api.v1.tags({ id: tagId }).put({
				slug: data.slug,
				name: data.name,
				type: data.type,
				color: data.color,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to update tag");
			}

			toast.success("Tag updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminTags"] });
			queryClient.invalidateQueries({ queryKey: ["tag", tagId] });
			queryClient.invalidateQueries({ queryKey: ["tags"] });
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update tag",
			);
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
										<Field>
											<FieldLabel htmlFor="name">Name *</FieldLabel>
											<Input
												id="name"
												{...form.register("name")}
												placeholder="Tag name"
											/>
											<FieldError errors={[form.formState.errors.name]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="slug">Slug *</FieldLabel>
											<Input
												id="slug"
												{...form.register("slug")}
												placeholder="tag-slug"
											/>
											<FieldError errors={[form.formState.errors.slug]} />
										</Field>

										<div className="grid grid-cols-2 gap-4">
											<Field>
												<FieldLabel htmlFor="type">Type *</FieldLabel>
												<Select
													value={form.watch("type")}
													onValueChange={(value) =>
														form.setValue(
															"type",
															value as TagFormValues["type"],
														)
													}
												>
													<SelectTrigger id="type">
														<SelectValue placeholder="Select type" />
													</SelectTrigger>
													<SelectContent>
														{tagTypeOptions.map((option) => (
															<SelectItem key={option} value={option}>
																{option.charAt(0).toUpperCase() +
																	option.slice(1)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FieldError errors={[form.formState.errors.type]} />
											</Field>

											<Field>
												<FieldLabel htmlFor="color">Color</FieldLabel>
												<Select
													value={form.watch("color")}
													onValueChange={(value) =>
														form.setValue(
															"color",
															value as TagFormValues["color"],
														)
													}
												>
													<SelectTrigger id="color">
														<SelectValue placeholder="Select color" />
													</SelectTrigger>
													<SelectContent>
														{badgeVariantOptions.map((option) => (
															<SelectItem key={option} value={option}>
																{option.charAt(0).toUpperCase() +
																	option.slice(1)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FieldError errors={[form.formState.errors.color]} />
											</Field>
										</div>
									</FieldGroup>
								</FieldSet>
							</FieldGroup>
						</div>

						<DrawerFooter className="shrink-0 border-t">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && (
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
