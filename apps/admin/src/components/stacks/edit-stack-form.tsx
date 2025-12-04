"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Stack } from "@missingstack/api/types";
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
const stackFormSchema = z.object({
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(120, "Slug must be 120 characters or less"),
	name: z
		.string()
		.min(1, "Name is required")
		.max(160, "Name must be 160 characters or less"),
	description: z.string().optional(),
	icon: z.string().max(100, "Icon must be 100 characters or less").optional(),
	parentId: z.string().uuid().optional().or(z.literal("")),
	weight: z.number().int().default(0),
});

type StackFormValues = z.infer<typeof stackFormSchema>;

interface EditStackFormProps {
	stackId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditStackForm({
	stackId,
	open,
	onOpenChange,
}: EditStackFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const queryClient = useQueryClient();

	// Fetch stack data
	const { data: stackData, isLoading: isLoadingStack } = useQuery({
		queryKey: ["stack", stackId],
		queryFn: async () => {
			if (!stackId) return null;
			const { data, error } = await api.v1.stacks({ id: stackId }).get();
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch stack");
			return data as Stack | null;
		},
		enabled: open && !!stackId,
	});

	// Fetch default stacks (top 10)
	const { data: stacksData } = useQuery({
		queryKey: ["stacks", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.stacks.get({});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch stacks");
			return Array.isArray(data) ? data.slice(0, 10) : [];
		},
	});

	const form = useForm({
		resolver: zodResolver(stackFormSchema),
		defaultValues: {
			slug: "",
			name: "",
			description: "",
			icon: "",
			parentId: "",
			weight: 0,
		},
	});

	// Update form when stack data is loaded
	useEffect(() => {
		if (stackData) {
			form.reset({
				slug: stackData.slug,
				name: stackData.name,
				description: stackData.description || "",
				icon: stackData.icon || "",
				parentId: stackData.parentId || "",
				weight: stackData.weight ?? 0,
			});
		}
	}, [stackData, form]);

	const onSubmit = async (data: StackFormValues) => {
		if (!stackId) return;

		setIsSubmitting(true);
		try {
			const { error } = await api.v1.stacks({ id: stackId }).put({
				slug: data.slug,
				name: data.name,
				description: data.description || undefined,
				icon: data.icon || undefined,
				parentId: data.parentId || undefined,
				weight: data.weight,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to update stack");
			}

			toast.success("Stack updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminStacks"] });
			queryClient.invalidateQueries({ queryKey: ["stack", stackId] });
			queryClient.invalidateQueries({ queryKey: ["stacks"] });
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update stack",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const stackOptions = (Array.isArray(stacksData) ? stacksData : [])
		.filter((stack: Stack) => stack.id !== stackId) // Exclude current stack from parent options
		.map((stack: Stack) => ({
			value: stack.id,
			label: stack.name,
		}));

	// Search function for API-based searching
	const searchStacks = async (search: string) => {
		const { data, error } = await api.v1.stacks.get({});
		if (error)
			throw new Error(error.value.message ?? "Failed to search stacks");
		const allStacks = Array.isArray(data) ? data : [];
		const filtered = allStacks
			.filter(
				(stack: Stack) =>
					stack.id !== stackId &&
					stack.name.toLowerCase().includes(search.toLowerCase()),
			)
			.slice(0, 10);
		return filtered.map((stack: Stack) => ({
			value: stack.id,
			label: stack.name,
		}));
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:max-w-lg! sm:data-[vaul-drawer-direction=right]:max-w-lg!">
				<DrawerHeader className="shrink-0 border-b">
					<DrawerTitle>Stack Details</DrawerTitle>
					<DrawerDescription>
						View and edit stack information. All fields are editable.
					</DrawerDescription>
				</DrawerHeader>

				{isLoadingStack ? (
					<div className="flex flex-1 items-center justify-center">
						<div className="flex flex-col items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="text-muted-foreground text-sm">
								Loading stack details...
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
												placeholder="Stack name"
											/>
											<FieldError errors={[form.formState.errors.name]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="slug">Slug *</FieldLabel>
											<Input
												id="slug"
												{...form.register("slug")}
												placeholder="stack-slug"
											/>
											<FieldError errors={[form.formState.errors.slug]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="description">Description</FieldLabel>
											<Textarea
												id="description"
												{...form.register("description")}
												placeholder="Stack description"
												rows={4}
											/>
											<FieldError
												errors={[form.formState.errors.description]}
											/>
										</Field>

										<Field>
											<FieldLabel htmlFor="icon">Icon</FieldLabel>
											<Input
												id="icon"
												{...form.register("icon")}
												placeholder="Icon name"
											/>
											<FieldError errors={[form.formState.errors.icon]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="parent">Parent Stack</FieldLabel>
											<Combobox
												options={stackOptions}
												selectedValues={
													form.watch("parentId")
														? [form.watch("parentId") as string]
														: []
												}
												onSelectedValuesChange={(values) =>
													form.setValue("parentId", values[0] || "")
												}
												placeholder="Select parent stack (optional)"
												searchPlaceholder="Search stacks..."
												searchFn={searchStacks}
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
								Update Stack
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
