"use client";

import {
	BarChart3,
	Clock,
	DollarSign,
	FolderTree,
	GitCompare,
	Layers,
	Layout,
	LayoutDashboard,
	Link2,
	Mail,
	Megaphone,
	Settings,
	Tags,
	Webhook,
	Workflow,
	Wrench,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "~/components/ui/sidebar";
import { config } from "~/lib/site-config";

const navigation = [
	{
		title: "Dashboard",
		url: "/admin",
		icon: LayoutDashboard,
	},
	{
		title: "Content",
		items: [
			{
				title: "Tools",
				url: "/admin/tools",
				icon: Wrench,
			},
			{
				title: "Categories",
				url: "/admin/categories",
				icon: FolderTree,
			},
			{
				title: "Stacks",
				url: "/admin/stacks",
				icon: Layers,
			},
			{
				title: "Tags",
				url: "/admin/tags",
				icon: Tags,
			},
		],
	},
	{
		title: "Discovery",
		items: [
			{
				title: "Sections",
				url: "/admin/sections",
				icon: Layout,
			},
			{
				title: "Alternatives",
				url: "/admin/alternatives",
				icon: GitCompare,
			},
		],
	},
	{
		title: "Engagement",
		items: [
			{
				title: "Newsletter",
				url: "/admin/newsletter",
				icon: Mail,
			},
			{
				title: "Analytics",
				url: "/admin/analytics",
				icon: BarChart3,
			},
		],
	},
	{
		title: "Growth",
		items: [
			{
				title: "Marketing",
				url: "/admin/marketing",
				icon: Megaphone,
			},
			{
				title: "Sponsorships",
				url: "/admin/sponsorships",
				icon: DollarSign,
			},
			{
				title: "Affiliate Links",
				url: "/admin/affiliate-links",
				icon: Link2,
			},
		],
	},
	{
		title: "Automation",
		items: [
			{
				title: "Scheduled Tasks",
				url: "/admin/automation/tasks",
				icon: Clock,
			},
			{
				title: "Workflows",
				url: "/admin/automation/workflows",
				icon: Workflow,
			},
			{
				title: "Webhooks",
				url: "/admin/automation/webhooks",
				icon: Webhook,
			},
			{
				title: "Integrations",
				url: "/admin/automation/integrations",
				icon: Zap,
			},
		],
	},
	{
		title: "Settings",
		items: [
			{
				title: "General",
				url: "/admin/settings",
				icon: Settings,
			},
		],
	},
];

export function AdminSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();

	const isActive = (url: string) => {
		if (url === "/admin") return pathname === "/admin";
		return pathname.startsWith(url);
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader className="max-h-16 border-sidebar-border border-b">
				<div className="flex items-center gap-2 px-2 py-2">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Wrench className="h-4 w-4" />
					</div>
					<div className="flex min-w-0 flex-col">
						<span className="truncate font-semibold text-sm">
							{config.title}
						</span>
						<span className="truncate text-sidebar-foreground/70 text-xs">
							Admin
						</span>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent className="no-scrollbar">
				{navigation.map((section, index) => (
					<SidebarGroup key={section.title || `nav-${index}`}>
						{section.title && (
							<SidebarGroupLabel>{section.title}</SidebarGroupLabel>
						)}
						<SidebarGroupContent>
							<SidebarMenu>
								{section.url ? (
									<SidebarMenuItem>
										<SidebarMenuButton asChild isActive={isActive(section.url)}>
											<Link href={section.url}>
												{section.icon && <section.icon />}
												<span>{section.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								) : (
									section.items?.map((item) => (
										<SidebarMenuItem key={item.url}>
											<SidebarMenuButton asChild isActive={isActive(item.url)}>
												<Link href={item.url}>
													{item.icon && <item.icon />}
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))
								)}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
		</Sidebar>
	);
}
