import {useRouteError} from "react-router";

export function ErrorHandler() {
	const error = useRouteError();
	const message = error instanceof Error ? error.message : "An unexpected error occurred.";

	return (
		<div style={{
			margin: "10px 0",
			padding: "0 10px 10px 10px",
			borderRadius: "5px",
			color: "#de222b",
			backgroundColor: "#ffcccc",
			border: "1px solid #f88888"
		}}>
			<h2>Something went wrong &trade;</h2>
			<div style={{color: "black"}}>
				{message}
			</div>
		</div >
	);
}