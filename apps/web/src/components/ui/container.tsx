import type * as React from "react";
import { cn } from "~/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: "default" | "sm" | "lg" | "full";
}

function Container({ className, size = "default", ...props }: ContainerProps) {
	return (
		<div
			data-slot="container"
			className={cn(
				"mx-auto w-full px-4 sm:px-6",
				size === "sm" && "max-w-3xl",
				size === "default" && "max-w-7xl",
				size === "lg" && "max-w-[1400px]",
				size === "full" && "max-w-full",
				className,
			)}
			{...props}
		/>
	);
}

export { Container };
