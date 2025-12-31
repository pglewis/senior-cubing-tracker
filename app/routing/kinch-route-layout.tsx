import {Outlet} from "react-router";
import {KinchProvider} from "@repo/app/features/kinch/context/kinch-provider";

// Route layout that wraps child routes with KinchProvider context
export function KinchRouteLayout() {
	return (
		<KinchProvider>
			<Outlet />
		</KinchProvider>
	);
}
