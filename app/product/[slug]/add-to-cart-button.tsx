"use client";

import { useMemo, useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";
import { useCart } from "@/app/cart/cart-context";
import { QuantitySelector } from "@/app/product/[slug]/quantity-selector";
import { TrustBadges } from "@/app/product/[slug]/trust-badges";
import { VariantSelector, type Selection } from "@/app/product/[slug]/variant-selector";
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
	const [selection, setSelection] = useState<Selection>(() => ({
		size: firstVariant?.size,
		color: firstVariant?.color,
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

			<div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Stock:</span>
					<span className="font-semibold text-foreground">
						{selectedVariant && selectedVariant.stock > 0 ? selectedVariant.stock : "Out of stock"}
					</span>
				</div>

				<div className="mt-4 flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<span className="text-sm text-muted-foreground">Qty:</span>
						<QuantitySelector
							quantity={quantity}
							onQuantityChange={setQuantity}
							max={maxQuantity}
							disabled={isPending || isOutOfStock}
							showLabel={false}
						/>
					</div>
					<div className="text-sm font-semibold text-foreground">
						Total:{" "}
						{totalPrice
							? formatMoney({ amount: totalPrice, currency: CURRENCY, locale: LOCALE })
							: formatMoney({ amount: BigInt(0), currency: CURRENCY, locale: LOCALE })}
					</div>
				</div>

				<form onSubmit={handleSubmit} className="mt-4">
					<button
						type="submit"
						disabled={isPending || isOutOfStock}
						className="h-12 w-full rounded-xl bg-foreground text-base font-semibold text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Ajouter au panier
					</button>
				</form>
			</div>

			<TrustBadges />
		</div>
	);
}
