import Twilio from "twilio";
import type { Order } from "@/lib/orders";

const getTwilioClient = () => {
	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	if (!accountSid || !authToken) {
		return null;
	}
	return Twilio(accountSid, authToken);
};

export async function sendOrderNotification(order: Order) {
	const client = getTwilioClient();
	if (!client) return;

	const from = process.env.TWILIO_WHATSAPP_NUMBER;
	const to = process.env.OWNER_WHATSAPP_NUMBER;
	if (!from || !to) return;

	const items = order.lineItems
		.map((item) => `${item.quantity}x ${item.productVariant.product.name}`)
		.join(", ");

	const body = `New paid order ${order.lookup} (${order.currency} ${order.subtotal}). Items: ${items}.`;

	await client.messages.create({
		from,
		to,
		body,
	});
}
