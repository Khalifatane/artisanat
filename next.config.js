/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
				pathname: "/images/**",
			},
		],
	},
	experimental: {
		cacheComponents: true,
	},
	turbopack: {
		root: __dirname,
	},
}

module.exports = nextConfig
