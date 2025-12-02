"use client";

import {
	FolderTree,
	Layers,
	LayoutDashboard,
	Link as LinkIcon,
	Settings,
	Tags,
	TrendingUp,
	Wrench,
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
			{
				title: "Alternatives",
				url: "/admin/alternatives",
				icon: LinkIcon,
			},
		],
	},
	{
		title: "Growth",
		items: [
			{
				title: "Marketing",
				url: "/admin/marketing",
				icon: TrendingUp,
			},
			{
				title: "Sponsorships",
				url: "/admin/sponsorships",
				icon: TrendingUp,
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

export function AdminSidebar() {
	const pathname = usePathname();

	const isActive = (url: string) => {
		if (url === "/admin") return pathname === "/admin";
		return pathname.startsWith(url);
	};

	return (
		<Sidebar>
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
			<SidebarContent>
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
