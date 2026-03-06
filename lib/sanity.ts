import "server-only";

import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { invariant } from "@/lib/invariant";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-02-01";
const token =
	process.env.SANITY_READ_TOKEN ??
	process.env.SANITY_API_TOKEN ??
	process.env.NEXT_PUBLIC_SANITY_TOKEN;

invariant(projectId, "Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
invariant(dataset, "Missing NEXT_PUBLIC_SANITY_DATASET");

export const sanityClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: process.env.NODE_ENV === "production",
	token,
});

const builder = imageUrlBuilder(sanityClient);

export const urlFor = (source: unknown) => builder.image(source as Parameters<typeof builder.image>[0]);
