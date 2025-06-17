import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	// Use environment variable for base URL, fallback to empty string for local dev
	base: process.env.VITE_BASE_URL || "",
	plugins: [react()],
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