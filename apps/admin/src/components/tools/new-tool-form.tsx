"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	LICENSE_OPTIONS,
	PRICING_OPTIONS,
} from "@missingstack/api/constants/enums";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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
	FieldDescription,
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
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/lib/eden";
import { formatPricingDisplay } from "~/lib/utils";

const pricingOptions = PRICING_OPTIONS;
const licenseOptions = LICENSE_OPTIONS;

// Form schema
const toolFormSchema = z.object({
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(120, "Slug must be 120 characters or less"),
	name: z
		.string()
		.min(1, "Name is required")
		.max(160, "Name must be 160 characters or less"),
	tagline: z
		.string()
		.max(256, "Tagline must be 256 characters or less")
		.optional(),
	description: z.string().min(1, "Description is required"),
	logo: z
		.string()
		.min(1, "Logo URL is required")
		.max(256, "Logo URL must be 256 characters or less"),
	website: z
		.string()
		.url("Must be a valid URL")
		.max(256, "Website URL must be 256 characters or less")
		.optional()
		.or(z.literal("")),
	pricing: z.enum(pricingOptions as [string, ...string[]]),
	license: z.enum(licenseOptions as [string, ...string[]]).optional(),
	featured: z.boolean(),
	categoryIds: z.array(z.string()),
	stackIds: z.array(z.string()),
	tagIds: z.array(z.string()),
	alternativeIds: z.array(z.string()),
});

type ToolFormValues = z.infer<typeof toolFormSchema>;

interface NewToolFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewToolForm({ open, onOpenChange }: NewToolFormProps) {
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	// Fetch default tags (top 10)
	const { data: tagsData } = useQuery({
		queryKey: ["tags", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.tags.get({});
			if (error) throw new Error(error.value.message ?? "Failed to fetch tags");
			return Array.isArray(data) ? data.slice(0, 10) : [];
		},
	});

	// Fetch default tools (top 10)
	const { data: toolsData } = useQuery({
		queryKey: ["tools", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.tools.get({
				query: { limit: 10 },
			});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch tools");
			return data;
		},
	});

	const form = useForm<ToolFormValues>({
		resolver: zodResolver(toolFormSchema),
		defaultValues: {
			slug: "",
			name: "",
			tagline: "",
			description: "",
			logo: "",
			website: "",
			pricing: "free",
			license: undefined,
			featured: false,
			categoryIds: [],
			stackIds: [],
			tagIds: [],
			alternativeIds: [],
		},
	});

	const onSubmit = async (data: ToolFormValues) => {
		setIsSubmitting(true);
		try {
			const { error } = await api.v1.tools.post({
				slug: data.slug,
				name: data.name,
				tagline: data.tagline || undefined,
				description: data.description,
				logo: data.logo,
				website: data.website || undefined,
				pricing: data.pricing,
				license: data.license || undefined,
				featured: data.featured,
				categoryIds: data.categoryIds,
				stackIds: data.stackIds,
				tagIds: data.tagIds,
				alternativeIds: data.alternativeIds,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to create tool");
			}

			toast.success("Tool created successfully!");
			queryClient.resetQueries({ queryKey: ["adminTools"] });
			form.reset();
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create tool",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const categoryOptions =
		categoriesData?.items.map((cat) => ({
			value: cat.id,
			label: cat.name,
		})) ?? [];

	const stackOptions = (Array.isArray(stacksData) ? stacksData : []).map(
		(stack: { id: string; name: string }) => ({
			value: stack.id,
			label: stack.name,
		}),
	);

	const tagOptions = (Array.isArray(tagsData) ? tagsData : []).map(
		(tag: { id: string; name: string }) => ({
			value: tag.id,
			label: tag.name,
		}),
	);

	const toolOptions =
		toolsData?.items.map((tool) => ({
			value: tool.id,
			label: tool.name,
		})) ?? [];

	// Search functions for API-based searching
	const searchCategories = async (search: string) => {
		const { data, error } = await api.v1.categories.get({
			query: { search, limit: 10 },
		});
		if (error)
			throw new Error(error.value.message ?? "Failed to search categories");
		return (
			data?.items.map((cat) => ({
				value: cat.id,
				label: cat.name,
			})) ?? []
		);
	};

	const searchStacks = async (search: string) => {
		const { data, error } = await api.v1.stacks.get({});
		if (error)
			throw new Error(error.value.message ?? "Failed to search stacks");
		const allStacks = Array.isArray(data) ? data : [];
		const filtered = allStacks
			.filter((stack: { name: string }) =>
				stack.name.toLowerCase().includes(search.toLowerCase()),
			)
			.slice(0, 10);
		return filtered.map((stack: { id: string; name: string }) => ({
			value: stack.id,
			label: stack.name,
		}));
	};

	const searchTags = async (search: string) => {
		const { data, error } = await api.v1.tags.get({});
		if (error) throw new Error(error.value.message ?? "Failed to search tags");
		const allTags = Array.isArray(data) ? data : [];
		const filtered = allTags
			.filter((tag: { name: string }) =>
				tag.name.toLowerCase().includes(search.toLowerCase()),
			)
			.slice(0, 10);
		return filtered.map((tag: { id: string; name: string }) => ({
			value: tag.id,
			label: tag.name,
		}));
	};

	const searchTools = async (search: string) => {
		const { data, error } = await api.v1.tools.get({
			query: { search, limit: 10 },
		});
		if (error) throw new Error(error.value.message ?? "Failed to search tools");
		return (
			data?.items.map((tool) => ({
				value: tool.id,
				label: tool.name,
			})) ?? []
		);
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:max-w-lg! sm:data-[vaul-drawer-direction=right]:max-w-lg!">
				<DrawerHeader className="shrink-0 border-b">
					<DrawerTitle>Create New Tool</DrawerTitle>
					<DrawerDescription>
						Add a new tool to the directory. Fill in all required fields.
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
											placeholder="Tool name"
										/>
										<FieldError errors={[form.formState.errors.name]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="slug">Slug *</FieldLabel>
										<Input
											id="slug"
											{...form.register("slug")}
											placeholder="tool-slug"
										/>
										<FieldDescription>
											URL-friendly identifier (e.g., "my-awesome-tool")
										</FieldDescription>
										<FieldError errors={[form.formState.errors.slug]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="tagline">Tagline</FieldLabel>
										<Input
											id="tagline"
											{...form.register("tagline")}
											placeholder="Short tagline"
										/>
										<FieldError errors={[form.formState.errors.tagline]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="description">Description *</FieldLabel>
										<Textarea
											id="description"
											{...form.register("description")}
											placeholder="Tool description"
											rows={4}
										/>
										<FieldError errors={[form.formState.errors.description]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="logo">Logo URL *</FieldLabel>
										<Input
											id="logo"
											{...form.register("logo")}
											placeholder="https://example.com/logo.png"
										/>
										<FieldError errors={[form.formState.errors.logo]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="website">Website</FieldLabel>
										<Input
											id="website"
											type="url"
											{...form.register("website")}
											placeholder="https://example.com"
										/>
										<FieldError errors={[form.formState.errors.website]} />
									</Field>

									<div className="grid grid-cols-2 gap-4">
										<Field>
											<FieldLabel htmlFor="pricing">Pricing *</FieldLabel>
											<Select
												value={form.watch("pricing")}
												onValueChange={(value) =>
													form.setValue(
														"pricing",
														value as ToolFormValues["pricing"],
													)
												}
											>
												<SelectTrigger id="pricing">
													<SelectValue placeholder="Select pricing" />
												</SelectTrigger>
												<SelectContent>
													{pricingOptions.map((option) => (
														<SelectItem key={option} value={option}>
															{formatPricingDisplay(option)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldError errors={[form.formState.errors.pricing]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="license">License</FieldLabel>
											<Select
												value={form.watch("license") ?? undefined}
												onValueChange={(value) =>
													form.setValue(
														"license",
														value as ToolFormValues["license"],
													)
												}
											>
												<SelectTrigger id="license">
													<SelectValue placeholder="Select license (optional)" />
												</SelectTrigger>
												<SelectContent>
													{licenseOptions.map((option) => (
														<SelectItem key={option} value={option}>
															{option.toUpperCase()}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldDescription>
												Optional license type for the tool
											</FieldDescription>
											<FieldError errors={[form.formState.errors.license]} />
										</Field>
									</div>
								</FieldGroup>
							</FieldSet>

							<FieldSet>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="categories">Categories</FieldLabel>
										<Combobox
											options={categoryOptions}
											multiple
											selectedValues={form.watch("categoryIds")}
											onSelectedValuesChange={(values) =>
												form.setValue("categoryIds", values)
											}
											placeholder="Select categories"
											searchPlaceholder="Search categories..."
											searchFn={searchCategories}
											defaultLimit={10}
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="stacks">Stacks</FieldLabel>
										<Combobox
											options={stackOptions}
											multiple
											selectedValues={form.watch("stackIds")}
											onSelectedValuesChange={(values) =>
												form.setValue("stackIds", values)
											}
											placeholder="Select stacks"
											searchPlaceholder="Search stacks..."
											searchFn={searchStacks}
											defaultLimit={10}
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="tags">Tags</FieldLabel>
										<Combobox
											options={tagOptions}
											multiple
											selectedValues={form.watch("tagIds")}
											onSelectedValuesChange={(values) =>
												form.setValue("tagIds", values)
											}
											placeholder="Select tags"
											searchPlaceholder="Search tags..."
											searchFn={searchTags}
											defaultLimit={10}
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="alternatives">Alternatives</FieldLabel>
										<Combobox
											options={toolOptions}
											multiple
											selectedValues={form.watch("alternativeIds")}
											onSelectedValuesChange={(values) =>
												form.setValue("alternativeIds", values)
											}
											placeholder="Select alternative tools"
											searchPlaceholder="Search tools..."
											searchFn={searchTools}
											defaultLimit={10}
										/>
										<FieldDescription>
											Select tools that are alternatives to this tool
										</FieldDescription>
									</Field>
								</FieldGroup>
							</FieldSet>

							<FieldSet>
								<FieldGroup>
									<Field orientation="horizontal">
										<Switch
											id="featured"
											checked={form.watch("featured")}
											onCheckedChange={(checked) =>
												form.setValue("featured", checked)
											}
										/>
										<FieldLabel htmlFor="featured" className="font-normal">
											Featured
										</FieldLabel>
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
							Create Tool
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
