"use client";

import { useMemo, useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";
import { useCart } from "@/app/cart/cart-context";
import { QuantitySelector } from "@/app/product/[slug]/quantity-selector";
import { TrustBadges } from "@/app/product/[slug]/trust-badges";
import { VariantSelector } from "@/app/product/[slug]/variant-selector";
import { CURRENCY, LOCALE } from "@/lib/constants";
import type { ProductVariant } from "@/lib/commerce";
import { formatMoney } from "@/lib/money";

type AddToCartButtonProps = {
	variants: ProductVariant[];
	product: {
		id: string;
		name: string;
		slug: string;
		images: string[];
	};
};

export function AddToCartButton({ variants, product }: AddToCartButtonProps) {
	const firstVariant = variants.find((variant) => variant.stock > 0) ?? variants[0];
	const [selection, setSelection] = useState(() => ({
		size: firstVariant?.size ?? "",
		color: firstVariant?.color ?? "",
	}));
	const [quantity, setQuantity] = useState(1);
	const [isPending, startTransition] = useTransition();
	const { openCart, dispatch } = useCart();

	const selectedVariant = useMemo(
		() => variants.find((v) => v.size === selection.size && v.color === selection.color) ?? firstVariant,
		[variants, selection, firstVariant],
	);

	const totalPrice = selectedVariant ? BigInt(selectedVariant.price) * BigInt(quantity) : null;
	const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
	const maxQuantity = selectedVariant?.stock && selectedVariant.stock > 0 ? selectedVariant.stock : 1;

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (!selectedVariant || isOutOfStock) return;

		openCart();

		startTransition(async () => {
			dispatch({
				type: "ADD_ITEM",
				item: {
					quantity,
					productVariant: {
						id: selectedVariant.id,
						price: selectedVariant.price,
						images: selectedVariant.images,
						size: selectedVariant.size,
						color: selectedVariant.color,
						stock: selectedVariant.stock,
						incomingStock: selectedVariant.incomingStock,
						restockDate: selectedVariant.restockDate,
						product,
					},
				},
			});

			await addToCart({
				productId: product.id,
				size: selectedVariant.size,
				color: selectedVariant.color,
				quantity,
			});
			setQuantity(1);
		});
	};

	return (
		<div className="space-y-6">
			<VariantSelector variants={variants} value={selection} onChange={setSelection} />

			<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
				<div className="flex items-center gap-3 text-sm">
					<span className="font-semibold text-foreground">Stock</span>
					<span className="font-medium text-foreground">
						{selectedVariant && selectedVariant.stock > 0 ? selectedVariant.stock : "Out of stock"}
					</span>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold">Quantity</span>
					<QuantitySelector
						quantity={quantity}
						onQuantityChange={setQuantity}
						max={maxQuantity}
						disabled={isPending || isOutOfStock}
						showLabel={false}
					/>
				</div>
			</div>

			<div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
				<div>
					<p className="text-xs text-muted-foreground">Total</p>
					<p className="text-base font-semibold text-foreground">
						{totalPrice
							? formatMoney({ amount: totalPrice, currency: CURRENCY, locale: LOCALE })
							: formatMoney({ amount: BigInt(0), currency: CURRENCY, locale: LOCALE })}
					</p>
				</div>
				<form onSubmit={handleSubmit}>
					<button
						type="submit"
						disabled={isPending || isOutOfStock}
						className="h-12 rounded-full bg-foreground px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Add to Cart
					</button>
				</form>
			</div>

			<TrustBadges />
		</div>
	);
}
