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
		<div className="space-y-8">
			<VariantSelector variants={variants} value={selection} onChange={setSelection} />

			{selectedVariant && (
				<div className="text-sm text-muted-foreground">
					<span className="font-medium text-foreground">Stock:</span>{" "}
					{selectedVariant.stock > 0 ? selectedVariant.stock : "Out of stock"}
				</div>
			)}

			<QuantitySelector
				quantity={quantity}
				onQuantityChange={setQuantity}
				max={maxQuantity}
				disabled={isPending || isOutOfStock}
			/>

			{totalPrice && (
				<p className="text-sm text-muted-foreground">
					Total: {formatMoney({ amount: totalPrice, currency: CURRENCY, locale: LOCALE })}
				</p>
			)}

			<form onSubmit={handleSubmit}>
				<button
					type="submit"
					disabled={isPending || isOutOfStock}
					className="w-full h-14 bg-foreground text-primary-foreground py-4 px-8 rounded-full text-base font-medium tracking-wide hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Add to Cart
				</button>
			</form>

			<TrustBadges />
		</div>
	);
}
