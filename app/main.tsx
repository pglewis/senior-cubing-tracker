import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {DataProvider} from "./context/data-provider";
import {ThemeProvider} from "./context/theme-provider";
import {App} from "@repo/app/app";
import "./styles/global.css";
import "./styles/utilities.css";

// Handle GitHub Pages SPA redirect
const redirect = sessionStorage.getItem("redirect");
const storedBasePath = sessionStorage.getItem("basePath");

if (redirect) {
	sessionStorage.removeItem("redirect");
	sessionStorage.removeItem("basePath");

	// Get the current base path from Vite config
	const currentBasePath = import.meta.env.BASE_URL || "/";

	// Use stored base path if available (from 404.html), otherwise use current
	const basePath = storedBasePath || currentBasePath;

	// Extract the route path for React Router
	let routePath = redirect;

	if (basePath !== "/" && redirect.startsWith(basePath)) {
		// Remove the base path to get the route for React Router
		routePath = redirect.substring(basePath.length - 1); // Keep the leading slash

		// Ensure we have a leading slash
		if (!routePath.startsWith("/")) {
			routePath = "/" + routePath;
		}
	}

	// Replace the current history entry with the intended route
	window.history.replaceState(null, "", routePath);
}

createRoot(document.getElementById("app")!).render(
	<StrictMode>
		<ThemeProvider>
			<DataProvider>
				<App />
			</DataProvider>
		</ThemeProvider>
	</StrictMode>,
);