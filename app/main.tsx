import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {DataProvider} from "./context/data-provider";
import {ThemeProvider} from "./context/theme-provider";
import {App} from "@repo/app/app";
import "./styles/global.css";
import "./styles/utilities.css";

// Handle GitHub Pages SPA redirect
const redirect = sessionStorage.getItem("redirect");
if (redirect) {
	sessionStorage.removeItem("redirect");
	// Get the base path and remove it from the redirect path for React Router
	const basePath = import.meta.env.BASE_URL || "/";
	const routePath = basePath === "/" ? redirect : redirect.replace(basePath, "/");
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