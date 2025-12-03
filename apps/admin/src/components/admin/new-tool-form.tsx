"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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

// Pricing enum values
const pricingOptions = [
	"Free",
	"Freemium",
	"Paid",
	"Open Source",
	"Enterprise",
] as const;

// License enum values
const licenseOptions = [
	"agpl-3",
	"mit",
	"apache-2",
	"gpl-3",
	"mpl-2",
	"bsd-3-clause",
	"gpl-2",
	"lgpl-2-1",
	"bsd-2-clause",
	"epl-2",
	"isc",
	"lgpl-3",
] as const;

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
	pricing: z.enum(pricingOptions),
	license: z.enum(licenseOptions).optional(),
	featured: z.boolean(),
	affiliateUrl: z
		.string()
		.url("Must be a valid URL")
		.max(512, "Affiliate URL must be 512 characters or less")
		.optional()
		.or(z.literal("")),
	sponsorshipPriority: z.number().int(),
	isSponsored: z.boolean(),
	monetizationEnabled: z.boolean(),
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
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch categories
	const { data: categoriesData } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const { data, error } = await api.v1.categories.get({});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch categories");
			return data;
		},
	});

	// Fetch stacks
	const { data: stacksData } = useQuery({
		queryKey: ["stacks"],
		queryFn: async () => {
			const { data, error } = await api.v1.stacks.get({});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch stacks");
			return data;
		},
	});

	// Fetch tags
	const { data: tagsData } = useQuery({
		queryKey: ["tags"],
		queryFn: async () => {
			const { data, error } = await api.v1.tags.get({});
			if (error) throw new Error(error.value.message ?? "Failed to fetch tags");
			return data;
		},
	});

	// Fetch tools for alternatives
	const { data: toolsData } = useQuery({
		queryKey: ["tools", "for-alternatives"],
		queryFn: async () => {
			const { data, error } = await api.v1.tools.get({
				query: { limit: 1000 },
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
			pricing: "Free",
			license: undefined,
			featured: false,
			affiliateUrl: "",
			sponsorshipPriority: 0,
			isSponsored: false,
			monetizationEnabled: false,
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
				affiliateUrl: data.affiliateUrl || undefined,
				sponsorshipPriority: data.sponsorshipPriority,
				isSponsored: data.isSponsored,
				monetizationEnabled: data.monetizationEnabled,
				categoryIds: data.categoryIds,
				stackIds: data.stackIds,
				tagIds: data.tagIds,
				alternativeIds: data.alternativeIds,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to create tool");
			}

			toast.success("Tool created successfully!");
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
															{option}
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

									<Field orientation="horizontal">
										<Switch
											id="isSponsored"
											checked={form.watch("isSponsored")}
											onCheckedChange={(checked) =>
												form.setValue("isSponsored", checked)
											}
										/>
										<FieldLabel htmlFor="isSponsored" className="font-normal">
											Sponsored
										</FieldLabel>
									</Field>

									<Field orientation="horizontal">
										<Switch
											id="monetizationEnabled"
											checked={form.watch("monetizationEnabled")}
											onCheckedChange={(checked) =>
												form.setValue("monetizationEnabled", checked)
											}
										/>
										<FieldLabel
											htmlFor="monetizationEnabled"
											className="font-normal"
										>
											Monetization Enabled
										</FieldLabel>
									</Field>
								</FieldGroup>
							</FieldSet>

							<FieldSet>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="affiliateUrl">
											Affiliate URL
										</FieldLabel>
										<Input
											id="affiliateUrl"
											type="url"
											{...form.register("affiliateUrl")}
											placeholder="https://example.com/affiliate"
										/>
										<FieldError errors={[form.formState.errors.affiliateUrl]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="sponsorshipPriority">
											Sponsorship Priority
										</FieldLabel>
										<Input
											id="sponsorshipPriority"
											type="number"
											{...form.register("sponsorshipPriority", {
												valueAsNumber: true,
											})}
											placeholder="0"
										/>
										<FieldDescription>
											Higher numbers appear first in sponsored listings
										</FieldDescription>
										<FieldError
											errors={[form.formState.errors.sponsorshipPriority]}
										/>
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
