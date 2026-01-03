import {Link} from "react-router";
import {ROUTES} from "@repo/app/routing/routes";
import staticStyles from "./static-page.module.css";
import styles from "./home.module.css";

export function Home() {
	return (
		<div className={staticStyles.container}>
			<div className={staticStyles.card}>
				<nav>
					<h2>Senior Cubing Tracker</h2>
					<h3 className={staticStyles.heading}>On the site</h3>
					<dl>
						<dt><Link to={ROUTES.KINCH_RANKS} className={styles.link}>Senior Kinch Ranks</Link></dt>
						<dd>
							Kinch Ranks are designed to measure a competitor&apos;s overall performance across all official WCA events.
						</dd>
					</dl>
					<dl>
						<dt><Link to={ROUTES.PROFILE} className={styles.link}>Senior Profile Pages</Link></dt>
						<dd>
							Overview page with a competitor&apos;s personal best and rankings for all events by age group
							and region.
						</dd>
					</dl>
					<dl>
						<dt><a href="https://pglewis.github.io/wca-recent-senior-records/recent/" target="_blank" rel="noopener noreferrer" className={styles.link}>Recent Senior Records</a></dt>
						<dd>
							Recent top senior results, see who is out there raising the bar for everyone else.
						</dd>
					</dl>
					<dl>
						<dt><Link to={ROUTES.KINCH_FAQ} className={styles.link}>Kinch Ranks FAQ</Link></dt>
						<dd>
							Learn more about how Kinch Ranks are calculated and how they measure overall cubing performance.
						</dd>
					</dl>
					<dl>
						<dt><Link to={ROUTES.COMPETITOR_DATA_FAQ} className={styles.link}>Competitor Data FAQ</Link></dt>
						<dd>
							Understand where the data comes from, how often it updates, and why your results might not appear immediately.
						</dd>
					</dl>
				</nav>
				<h3 className={staticStyles.heading}>Other Senior Cubing Resources</h3>
				<dl>
					<dt>
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://wca-seniors.org/"
						>
							Senior Rankings (WCA Seniors)
						</a>
					</dt>
					<dd>
						<p>
							Michael George&apos;s senior rankings data is the foundation of this site, it would be impossible
							without his ongoing efforts to compile and maintain official results and ranking data for
							competitors over 40.
						</p>
						<p>
							Here you can find:
						</p>
						<ul className="disc">
							<li>
								The
								{" "}
								<a href="https://wca-seniors.org/Registration.html" target="_blank" rel="noopener noreferrer">
									registration page
								</a>
								{" "}
								to opt-in to the senior rankings
							</li>
							<li>
								The full
								{" "}
								<a href="https://wca-seniors.org/Senior_Rankings.html" target="_blank" rel="noopener noreferrer">
									Senior Rankings
								</a>
								{" "}
								list
							</li>
							<li>
								<a href="https://wca-seniors.org/Recent_Competitions.html" target="_blank" rel="noopener noreferrer">
									Recent Competitions
								</a>
								{" "}
								with 40+ competitors
							</li>
							<li>
								<a href="https://wca-seniors.org/Future_Competitions.html" target="_blank" rel="noopener noreferrer">
									Future Competitions
								</a>
								{" "}
								with 40+ competitors
							</li>
						</ul>
					</dd>
				</dl>
				<dl>
					<dt>
						<a
							href="https://www.facebook.com/groups/1604105099735401"
							target="_blank"
							rel="noopener noreferrer"
						>
							Senior Cubers Worldwide
						</a>
					</dt>
					<dd>
						Facebook group focused on competitors over 40 (cubers of all ages are welcome). Weekly video competitions,
						daily scrambles, daily challenges, and more.
					</dd>
				</dl>
				<dl>
					<dt>
						<a
							href="https://www.speedsolving.com/threads/older-cubers-discussions.37405/"
							target="_blank"
							rel="noopener noreferrer"
						>
							&quot;Older cubers discussions&quot; forum thread on SpeedSolving.com
						</a>
					</dt>
					<dd>
						This is where it all started.
					</dd>
				</dl>
			</div>
		</div>
	);
}
