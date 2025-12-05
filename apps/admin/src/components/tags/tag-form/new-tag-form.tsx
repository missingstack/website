"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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
import { useCreateTag } from "~/hooks/tags";
import { TagBasicFields, TagTypeColorFields } from "./fields";
import {
	type TagFormValues,
	defaultTagFormValues,
	tagFormSchema,
} from "./shared/tag-form-schema";

interface NewTagFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewTagForm({ open, onOpenChange }: NewTagFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createMutation = useCreateTag();

	const form = useForm<TagFormValues>({
		resolver: zodResolver(tagFormSchema),
		defaultValues: defaultTagFormValues,
	});

	const onSubmit = async (data: TagFormValues) => {
		setIsSubmitting(true);
		try {
			await createMutation.mutateAsync(
				{
					slug: data.slug,
					name: data.name,
					type: data.type,
					color: data.color ?? "default",
				},
				{
					onSuccess: () => {
						form.reset();
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
									<TagBasicFields form={form} />
									<TagTypeColorFields form={form} />
								</FieldGroup>
							</FieldSet>
						</FieldGroup>
					</div>

					<DrawerFooter className="shrink-0 border-t">
						<Button
							type="submit"
							disabled={isSubmitting || createMutation.isPending}
						>
							{(isSubmitting || createMutation.isPending) && (
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
