"use client";

import { useMemo } from "react";
import type { ProductVariant } from "@/lib/commerce";

type Selection = {
	size?: string;
	color?: string;
};

type VariantSelectorProps = {
	variants: ProductVariant[];
	value: Selection;
	onChange: (value: Selection) => void;
};

const getUniqueValues = (values: string[]) => Array.from(new Set(values));

export function VariantSelector({ variants, value, onChange }: VariantSelectorProps) {
	const sizes = useMemo(() => getUniqueValues(variants.map((v) => v.size)), [variants]);
	const colors = useMemo(() => getUniqueValues(variants.map((v) => v.color)), [variants]);

	const isSizeDisabled = (size: string) => {
		if (!value.color) {
			return !variants.some((v) => v.size === size && v.stock > 0);
		}
		return !variants.some((v) => v.size === size && v.color === value.color && v.stock > 0);
	};

	const isColorDisabled = (color: string) => {
		if (!value.size) {
			return !variants.some((v) => v.color === color && v.stock > 0);
		}
		return !variants.some((v) => v.size === value.size && v.color === color && v.stock > 0);
	};

	const handleSizeChange = (size: string) => {
		const nextColor =
			variants.find((v) => v.size === size && v.stock > 0)?.color ??
			variants.find((v) => v.size === size)?.color;
		onChange({ size, color: nextColor });
	};

	const handleColorChange = (color: string) => {
		const nextSize =
			variants.find((v) => v.color === color && v.stock > 0)?.size ??
			variants.find((v) => v.color === color)?.size;
		onChange({ size: nextSize, color });
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Size</label>
				<select
					value={value.size ?? ""}
					onChange={(event) => handleSizeChange(event.target.value)}
					className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
				>
					{sizes.map((size) => (
						<option key={size} value={size} disabled={isSizeDisabled(size)}>
							{size}
						</option>
					))}
				</select>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Color</label>
				<select
					value={value.color ?? ""}
					onChange={(event) => handleColorChange(event.target.value)}
					className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
				>
					{colors.map((color) => (
						<option key={color} value={color} disabled={isColorDisabled(color)}>
							{color}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
