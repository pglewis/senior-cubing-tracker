import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";
import {readFileSync, writeFileSync} from "fs";
import {resolve} from "path";

// https://vite.dev/config/
export default defineConfig({
	// Use environment variable for base URL, fallback to empty string for local dev
	base: process.env.VITE_BASE_URL || "",
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "robots.txt"],
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
				cleanupOutdatedCaches: true,
				runtimeCaching: [{
					urlPattern: /\/data\/.*\.json$/,
					handler: "NetworkFirst",
					options: {
						cacheName: "senior-cubing-data",
						networkTimeoutSeconds: 10,
					}
				}]
			},
			manifest: {
				name: "Senior Cubing Tracker",
				short_name: "Senior Cubing",
				description: "Track senior speedcubing rankings and Kinch scores",
				theme_color: "#1a1d24",
				background_color: "#1a1d24",
				display: "standalone",
				orientation: "portrait",
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "/icons/icon-48x48.png",
						sizes: "48x48",
						type: "image/png"
					},
					{
						src: "/icons/icon-72x72.png",
						sizes: "72x72",
						type: "image/png"
					},
					{
						src: "/icons/icon-96x96.png",
						sizes: "96x96",
						type: "image/png"
					},
					{
						src: "/icons/icon-128x128.png",
						sizes: "128x128",
						type: "image/png"
					},
					{
						src: "/icons/icon-144x144.png",
						sizes: "144x144",
						type: "image/png"
					},
					{
						src: "/icons/icon-152x152.png",
						sizes: "152x152",
						type: "image/png"
					},
					{
						src: "/icons/icon-192x192.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						src: "/icons/icon-384x384.png",
						sizes: "384x384",
						type: "image/png"
					},
					{
						src: "/icons/icon-512x512.png",
						sizes: "512x512",
						type: "image/png"
					}
				]
			}
		}),
		{
			name: "post-build-html-transform",
			writeBundle(options) {
				const fullBaseUrl = process.env.VITE_FULL_BASE_URL || "";
				if (!fullBaseUrl) return;

				const outDir = options.dir || "../dist";
				const indexPath = resolve(outDir, "index.html");
				let html = readFileSync(indexPath, "utf-8");
				// Replace the favicon href to make it absolute
				html = html.replace(
					/<link rel="shortcut icon"[^>]*href="\.\.?\/favicon\.ico"/,
					`<link rel="shortcut icon" type="image/x-icon" href="${fullBaseUrl}/favicon.ico"`
				);
				writeFileSync(indexPath, html);
			}
		}
	],
	build: {
		target: "es2022",
		outDir: "../dist",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				"main": "index.html",
				"404": "404.html",
			},
		},
	},
});