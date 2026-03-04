"use server";

import { redirect } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { createOrder } from "@/lib/orders";
import { initializePaystackTransaction } from "@/lib/paystack";

export async function getCart() {
	try {
		return await commerce.cartGet();
	} catch {
		return null;
	}
}

export async function addToCart({
	productId,
	size,
	color,
	quantity = 1,
}: {
	productId: string;
	size: string;
	color: string;
	quantity?: number;
}) {
	const product = await commerce.productGet({ idOrSlug: productId });
	if (!product) {
		return { success: false, cart: null };
	}

	const variant = product.variants.find((v) => v.size === size && v.color === color);
	if (!variant) {
		return { success: false, cart: null };
	}

	if (variant.stock <= 0 || quantity > variant.stock) {
		return { success: false, cart: null };
	}

	const cart = await commerce.cartAddItem(product, variant, quantity);
	return { success: true, cart };
}

export async function removeFromCart(variantId: string) {
	try {
		const cart = await commerce.cartRemoveItem(variantId);
		return { success: true, cart };
	} catch {
		return { success: false, cart: null };
	}
}

// Set absolute quantity for a cart item
// Calculates delta internally since cartUpsert uses delta behavior
export async function setCartQuantity(variantId: string, quantity: number) {
	try {
		const cart = await commerce.cartGet();
		if (!cart) {
			return { success: false, cart: null };
		}

		const lineItem = cart.lineItems.find((item) => item.productVariant.id === variantId);
		if (!lineItem) {
			return { success: false, cart };
		}

		const product = await commerce.productGet({ idOrSlug: lineItem.productVariant.product.id });
		if (!product) {
			return { success: false, cart };
		}

		const variant = product.variants.find(
			(v) => v.size === lineItem.productVariant.size && v.color === lineItem.productVariant.color,
		);
		if (!variant || quantity > variant.stock) {
			return { success: false, cart };
		}

		const updated = await commerce.cartUpdateQuantity(variantId, quantity);
		return { success: true, cart: updated };
	} catch {
		return { success: false, cart: null };
	}
}

export async function checkout(formData: FormData) {
	const email = String(formData.get("email") ?? "").trim();
	if (!email || !email.includes("@")) {
		throw new Error("A valid email is required.");
	}

	const cart = await commerce.cartGet();
	if (!cart || cart.lineItems.length === 0) {
		throw new Error("Cart is empty.");
	}

	const subtotal = cart.lineItems.reduce((sum, item) => {
		return sum + BigInt(item.productVariant.price) * BigInt(item.quantity);
	}, BigInt(0));

	const orderId = crypto.randomUUID();
	const order = await createOrder({
		id: orderId,
		email,
		lineItems: cart.lineItems,
		subtotal: subtotal.toString(),
	});

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
	const callbackUrl = `${siteUrl}/order/success/${order.id}`;
	const authorizationUrl = await initializePaystackTransaction({
		email,
		amount: Number(subtotal),
		reference: order.id,
		callbackUrl,
	});

	redirect(authorizationUrl);
}
