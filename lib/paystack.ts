import { invariant } from "@/lib/invariant";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const getPaystackSecret = () => {
	const secret = process.env.PAYSTACK_SECRET_KEY;
	invariant(secret, "Missing PAYSTACK_SECRET_KEY");
	return secret;
};

export async function initializePaystackTransaction({
	email,
	amount,
	reference,
	callbackUrl,
}: {
	email: string;
	amount: number;
	reference: string;
	callbackUrl: string;
}) {
	const secret = getPaystackSecret();

	const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${secret}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email,
			amount,
			reference,
			callback_url: callbackUrl,
		}),
	});

	if (!res.ok) {
		throw new Error(`Paystack initialize failed: ${res.status}`);
	}

	const payload = (await res.json()) as {
		status: boolean;
		message: string;
		data?: { authorization_url: string };
	};

	if (!payload.status || !payload.data?.authorization_url) {
		throw new Error(`Paystack initialize error: ${payload.message}`);
	}

	return payload.data.authorization_url;
}

export async function verifyPaystackTransaction(reference: string) {
	const secret = getPaystackSecret();

	const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${secret}`,
			"Content-Type": "application/json",
		},
	});

	if (!res.ok) {
		throw new Error(`Paystack verify failed: ${res.status}`);
	}

	const payload = (await res.json()) as {
		status: boolean;
		message: string;
		data?: {
			status: "success" | "failed" | "abandoned";
			reference: string;
			amount: number;
			currency: string;
			customer?: { email?: string };
		};
	};

	return payload;
}
