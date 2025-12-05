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
import { useStack, useUpdateStack } from "~/hooks/stacks";
import { StackBasicFields, StackParentField, StackWeightField } from "./fields";
import {
	type StackFormValues,
	defaultStackFormValues,
	stackFormSchema,
} from "./shared/stack-form-schema";

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
	const { data: stackData, isLoading: isLoadingStack } = useStack(stackId);
	const updateMutation = useUpdateStack(stackId);

	const form = useForm<StackFormValues>({
		resolver: zodResolver(stackFormSchema),
		defaultValues: defaultStackFormValues,
	});

	useEffect(() => {
		if (!open) {
			form.reset(defaultStackFormValues);
		}
	}, [open, form]);

	useEffect(() => {
		if (stackData && open) {
			form.reset({
				slug: stackData.slug,
				name: stackData.name,
				description: stackData.description || "",
				icon: stackData.icon || "",
				parentId: stackData.parentId || "",
				weight: stackData.weight ?? 0,
			});
		}
	}, [stackData, open, form]);

	const onSubmit = async (data: StackFormValues) => {
		if (!stackId) return;

		setIsSubmitting(true);
		try {
			await updateMutation.mutateAsync(
				{
					slug: data.slug,
					name: data.name,
					description: data.description || undefined,
					icon: data.icon || undefined,
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
										<StackBasicFields form={form} />
										<StackParentField form={form} excludeStackId={stackId} />
										<StackWeightField form={form} />
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
