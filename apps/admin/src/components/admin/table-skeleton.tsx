import { Skeleton } from "~/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

interface TableSkeletonProps {
	/** Number of columns to display */
	columnCount: number;
	/** Number of skeleton rows to display */
	rowCount?: number;
	/** Whether to show the search bar skeleton */
	showSearch?: boolean;
	/** Optional array of column widths. If not provided, default widths are used */
	columnWidths?: string[];
	/** Optional array of column headers. If provided, these will be shown in the header */
	columnHeaders?: string[];
}

export function TableSkeleton({
	columnCount,
	rowCount = 5,
	showSearch = true,
	columnWidths,
	columnHeaders,
}: TableSkeletonProps) {
	return (
		<div className="flex flex-1 flex-col gap-4">
			{/* Search bar skeleton */}
			{showSearch && (
				<div className="flex items-center gap-2">
					<div className="relative max-w-sm flex-1">
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			)}

			{/* Table skeleton */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{Array.from({ length: columnCount }).map((_, i) => {
								const width = columnWidths?.[i];
								return (
									<TableHead
										// biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton header columns never reorder
										key={`skeleton-header-${i}`}
										className={width?.trim() ? width : undefined}
									>
										{columnHeaders?.[i] || <Skeleton className="h-4 w-20" />}
									</TableHead>
								);
							})}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: rowCount }).map((_, rowIndex) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton rows never reorder
							<TableRow key={`skeleton-row-${rowIndex}`}>
								{Array.from({ length: columnCount }).map((_, colIndex) => {
									const columnWidth = columnWidths?.[colIndex];
									// Extract width from className like "w-[200px]" or use default
									let skeletonWidth = "w-[100px]";
									if (columnWidth?.trim()) {
										// If column has a specific width, use a proportional skeleton
										const widthMatch = columnWidth.match(/w-\[(\d+)px\]/);
										if (widthMatch) {
											const px = Number.parseInt(widthMatch[1], 10);
											skeletonWidth = `w-[${Math.min(px - 20, 150)}px]`;
										} else {
											skeletonWidth = "w-full max-w-[150px]";
										}
									} else if (colIndex === 0) {
										skeletonWidth = "w-[150px]";
									} else if (colIndex === 1) {
										skeletonWidth = "w-[200px]";
									}
									return (
										// biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton cells never reorder
										<TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
											<Skeleton className={`h-4 ${skeletonWidth}`} />
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
