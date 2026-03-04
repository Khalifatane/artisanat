import { cookies } from "next/headers";
import { CURRENCY } from "@/lib/constants";
import type { CartLineItem } from "@/types/cart";

const ORDERS_COOKIE = "yns_orders";

export type OrderStatus = "pending" | "paid" | "failed";

export type Order = {
	id: string;
	lookup: string;
	status: OrderStatus;
	email: string;
	lineItems: CartLineItem[];
	subtotal: string;
	currency: string;
	createdAt: string;
	paidAt?: string;
};

type OrdersCookie = Record<string, Order>;

const readOrdersCookie = async (): Promise<OrdersCookie> => {
	const raw = (await cookies()).get(ORDERS_COOKIE)?.value;
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw) as OrdersCookie;
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
};

const writeOrdersCookie = async (orders: OrdersCookie) => {
	(await cookies()).set(ORDERS_COOKIE, JSON.stringify(orders), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});
};

const buildLookup = (id: string) => id.replace(/-/g, "").slice(-6).toUpperCase();

export async function createOrder({
	id,
	email,
	lineItems,
	subtotal,
}: {
	id: string;
	email: string;
	lineItems: CartLineItem[];
	subtotal: string;
}) {
	const orders = await readOrdersCookie();
	const order: Order = {
		id,
		lookup: buildLookup(id),
		status: "pending",
		email,
		lineItems,
		subtotal,
		currency: CURRENCY,
		createdAt: new Date().toISOString(),
	};
	orders[id] = order;
	await writeOrdersCookie(orders);
	return order;
}

export async function getOrder(id: string) {
	const orders = await readOrdersCookie();
	return orders[id] ?? null;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
	const orders = await readOrdersCookie();
	const existing = orders[id];
	if (!existing) return null;
	const updated: Order = {
		...existing,
		status,
		paidAt: status === "paid" ? new Date().toISOString() : existing.paidAt,
	};
	orders[id] = updated;
	await writeOrdersCookie(orders);
	return updated;
}
