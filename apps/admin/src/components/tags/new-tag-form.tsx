"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	BADGE_VARIANT_OPTIONS,
	TAG_TYPE_OPTIONS,
} from "@missingstack/api/constants/enums";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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

const tagTypeOptions = TAG_TYPE_OPTIONS;
const badgeVariantOptions = BADGE_VARIANT_OPTIONS;

// Form schema
const tagFormSchema = z.object({
	slug: z.string().min(1, "Slug is required"),
	name: z.string().min(1, "Name is required"),
	type: z.enum(tagTypeOptions as [string, ...string[]]),
	color: z.enum(badgeVariantOptions as [string, ...string[]]).optional(),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

interface NewTagFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewTagForm({ open, onOpenChange }: NewTagFormProps) {
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<TagFormValues>({
		resolver: zodResolver(tagFormSchema),
		defaultValues: {
			slug: "",
			name: "",
			type: "feature",
			color: "default",
		},
	});

	const onSubmit = async (data: TagFormValues) => {
		setIsSubmitting(true);
		try {
			const { error } = await api.v1.tags.post({
				slug: data.slug,
				name: data.name,
				type: data.type,
				color: data.color ?? "default",
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to create tag");
			}

			toast.success("Tag created successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminTags"] });
			form.reset();
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create tag",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:max-w-lg! sm:data-[vaul-drawer-direction=right]:max-w-lg!">
				<DrawerHeader className="shrink-0 border-b">
					<DrawerTitle>Create New Tag</DrawerTitle>
					<DrawerDescription>
						Add a new tag to the directory. Fill in all required fields.
					</DrawerDescription>
				</DrawerHeader>

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
													form.setValue("type", value as TagFormValues["type"])
												}
											>
												<SelectTrigger id="type">
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													{tagTypeOptions.map((option) => (
														<SelectItem key={option} value={option}>
															{option.charAt(0).toUpperCase() + option.slice(1)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldError errors={[form.formState.errors.type]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="color">Color</FieldLabel>
											<Select
												value={form.watch("color") ?? "default"}
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
															{option.charAt(0).toUpperCase() + option.slice(1)}
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
							Create Tag
						</Button>
						<DrawerClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
