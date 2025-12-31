import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {RouterProvider} from "react-router";
import {appRouter} from "@repo/app/routing/app-router";
import {DataProvider} from "./context/data-provider";
import {ThemeProvider} from "./context/theme-provider";
import "./styles/global.css";

createRoot(document.getElementById("app")!).render(
	<StrictMode>
		<ThemeProvider>
			<DataProvider>
				<RouterProvider router={appRouter} />
			</DataProvider>
		</ThemeProvider>
	</StrictMode>,
);
