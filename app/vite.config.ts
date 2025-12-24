import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {readFileSync, writeFileSync} from "fs";
import {resolve} from "path";

// https://vite.dev/config/
export default defineConfig({
	// Use environment variable for base URL, fallback to empty string for local dev
	base: process.env.VITE_BASE_URL || "",
	plugins: [
		react(),
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