import staticStyles from "./static-page.module.css";

export function CompetitorDataFaq() {
	return (
		<div className={staticStyles.container}>
			<div className={staticStyles.card}>
				<h3 className={staticStyles.heading}>Competitor Data FAQ</h3>

				<h4 className={staticStyles.subheading}>Where does the data come from?</h4>
				<p>
					All results come from the World Cube Association results export, which is the
					authoritative source for all official cubing competition results.
				</p>
				<p>
					Since the WCA does not track competitors by age group, we rely on the Senior
					Rankings database maintained at
					{" "}
					<a href="https://wca-seniors.org/" target="_blank" rel="noopener noreferrer">
						wca-seniors.org
					</a>
					{" "}
					to identify senior competitors (age 40+).  The senior rankings are opt-in, to be
					included in the rankings you need to go to the
					{" "}
					<a href="https://wca-seniors.org/Registration.html" target="_blank" rel="noopener noreferrer">
						registration page
					</a>
					{" "}
					and supply your WCA ID and DOB.
				</p>

				<h4 className={staticStyles.subheading}>How often is the data updated?</h4>
				<ul className="disc">
					<li>
						<strong>WCA results export:</strong> Should update at least weekly, after each
						competition weekend when the results are finalized.
					</li>
					<li>
						<strong>Senior Rankings database:</strong> Updates daily to reflect newly
						identified senior competitors and the latest results.
					</li>
					<li>
						<strong>Our rankings:</strong> We consume the Senior Rankings data to
						generate our rankings, typically within an hour or so of the Senior
						Rankings data update.
					</li>
				</ul>

				<h4 className={staticStyles.subheading}>Why aren&apos;t my results showing up yet?</h4>
				<p>
					There are a few reasons a recent competition result might not appear immediately:
				</p>
				<ul className="disc">
					<li>
						The WCA results export hasn&apos;t been updated yet, check the date of the
						most recent export file:
						{" "}
						<a href="https://www.worldcubeassociation.org/export/results" target="_blank" rel="noopener noreferrer">WCA Results Export</a>
						{" "}
					</li>
					<li>
						You may need to register as a senior competitor at the
						{" "}
						<a href="https://wca-seniors.org/Registration.html" target="_blank" rel="noopener noreferrer">
							Senior Rankings registration page
						</a>
						{" "}
						if this is your first time competing as a registered senior
					</li>
					<li>
						We may not have done the daily data update yet, check the &quot;Data last
						refreshed&quot; dates reported here and at
						{" "}
						<a href="https://wca-seniors.org/" target="_blank" rel="noopener noreferrer">
							wca-seniors.org
						</a>
						{" "}
					</li>
				</ul>
			</div>
		</div>
	);
}
