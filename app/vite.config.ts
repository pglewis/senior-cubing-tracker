import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	base: "",
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
