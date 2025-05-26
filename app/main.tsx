import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {DataProvider} from "@repo/app/contexts/data-context";
import {App} from "@repo/app/app";
import "./styles/global.css";
import "./styles/utilities.css";

createRoot(document.getElementById("app")!).render(
	<StrictMode>
		<DataProvider>
			<App />
		</DataProvider>
	</StrictMode>,
);
