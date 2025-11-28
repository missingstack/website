/**
 * Icon mapping utility
 *
 * Maps icon name strings (from JSON) to actual Lucide icon components.
 * This allows categories.json to store icon names as strings.
 */

import {
	BarChart3,
	Briefcase,
	Cloud,
	Code2,
	Database,
	FileText,
	Globe,
	HelpCircle,
	type LucideIcon,
	MessagesSquare,
	Palette,
	Play,
	ShieldCheck,
	ShoppingCart,
	Sparkles,
	Users,
	Workflow,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
	Code2,
	Cloud,
	Database,
	ShieldCheck,
	Workflow,
	Sparkles,
	FileText,
	Palette,
	MessagesSquare,
	Briefcase,
	ShoppingCart,
	Globe,
	Play,
	BarChart3,
	Users,
};

export function getIcon(name: string): LucideIcon {
	return iconMap[name] ?? HelpCircle;
}

export { iconMap };
