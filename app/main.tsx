import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {DataProvider} from "./context/data-provider";
import {ThemeProvider} from "./context/theme-provider";
import {App} from "@repo/app/app";
import "./styles/global.css";
import "./styles/utilities.css";

// Single Page Apps for GitHub Pages
// MIT License
// https://github.com/rafgraph/spa-github-pages
// This script checks to see if a redirect is present in the query string,
// converts it back into the correct url and adds it to the
// browser's history using window.history.replaceState(...),
// which won't cause the browser to attempt to load the new url.
// When the single page app is loaded further down in this file,
// the correct url will be waiting in the browser's history for
// the single page app to route accordingly.
(function(l) {
	if (l.search[1] === "/") {
		const decoded = l.search.slice(1).split("&").map(function(s) {
			return s.replace(/~and~/g, "&");
		}).join("?");
		window.history.replaceState(null, "",
			l.pathname.slice(0, -1) + decoded + l.hash
		);
	}
}(window.location));

createRoot(document.getElementById("app")!).render(
	<StrictMode>
		<ThemeProvider>
			<DataProvider>
				<App />
			</DataProvider>
		</ThemeProvider>
	</StrictMode>,
);