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

	const isTailleDisabled = (size: string) => {
		if (!value.color) {
			return !variants.some((v) => v.size === size && v.stock > 0);
		}
		return !variants.some((v) => v.size === size && v.color === value.color && v.stock > 0);
	};

	const isCouleurDisabled = (color: string) => {
		if (!value.size) {
			return !variants.some((v) => v.color === color && v.stock > 0);
		}
		return !variants.some((v) => v.size === value.size && v.color === color && v.stock > 0);
	};

	const handleTailleChange = (size: string) => {
		const nextCouleur =
			variants.find((v) => v.size === size && v.stock > 0)?.color ??
			variants.find((v) => v.size === size)?.color;
		onChange({ size, color: nextCouleur });
	};

	const handleCouleurChange = (color: string) => {
		const nextTaille =
			variants.find((v) => v.color === color && v.stock > 0)?.size ??
			variants.find((v) => v.color === color)?.size;
		onChange({ size: nextTaille, color });
	};

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<div className="space-y-2">
				<label className="text-sm font-semibold">Taille</label>
				<select
					value={value.size ?? ""}
					onChange={(event) => handleTailleChange(event.target.value)}
					className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
				>
					{sizes.map((size) => (
						<option key={size} value={size} disabled={isTailleDisabled(size)}>
							{size}
						</option>
					))}
				</select>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-semibold">Couleur</label>
				<select
					value={value.color ?? ""}
					onChange={(event) => handleCouleurChange(event.target.value)}
					className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
				>
					{colors.map((color) => (
						<option key={color} value={color} disabled={isCouleurDisabled(color)}>
							{color}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
