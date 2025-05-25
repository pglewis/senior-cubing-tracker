import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {DataProvider} from "./contexts/data-context";
import {App} from "./app";
import "./styles/global.css";
import "./styles/utilities.css";

createRoot(document.getElementById("app")!).render(
	<StrictMode>
		<DataProvider>
			<App />
		</DataProvider>
	</StrictMode>,
);
