import {Link} from "react-router";
import {ROUTES} from "@repo/app/routes";
import {ExternalLinks} from "../components/external-links/external-links";

export function Home() {
	return (
		<>
			<nav>
				<h3>On the site</h3>
				<dl>
					<dt><Link to={ROUTES.RECENT}>Recent Senior Records</Link></dt>
					<dd>
						Shows the recent top senior results, see who is out there raising the bar for everyone else.
					</dd>
				</dl>
				<dl>
					<dt><Link to={ROUTES.KINCH_RANKS}>Senior Kinch Ranks</Link></dt>
					<dd>
						Kinch Ranks are designed to measure a cuber&apos;s overall performance across all official WCA events.
					</dd>
				</dl>
			</nav>

			<h3>Other Senior Cubing Resources</h3>
			<ExternalLinks />
		</>
	);
}