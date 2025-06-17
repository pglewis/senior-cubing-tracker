import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {DataProvider} from "./context/data-provider";
import {ThemeProvider} from "./context/theme-provider";
import {App} from "@repo/app/app";
import "./styles/global.css";
import "./styles/utilities.css";

createRoot(document.getElementById("app")!).render(
	<StrictMode>
		<ThemeProvider>
			<DataProvider>
				<App />
			</DataProvider>
		</ThemeProvider>
	</StrictMode>,
);