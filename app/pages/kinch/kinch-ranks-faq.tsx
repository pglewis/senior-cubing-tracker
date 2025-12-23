import staticStyles from "../static-page.module.css";

export function KinchRanksFaq() {
	return (
		<div className={staticStyles.container}>
			<div className={staticStyles.card}>
				<h3 className={staticStyles.heading}>Senior Kinch Ranks FAQ</h3>
				<p>
					Kinch Ranks is a system designed to measure competitors&apos; overall performance across all official WCA
					events. The details of how the ranks are calculated can be found in the
					{" "}
					<a href="https://www.speedsolving.com/threads/all-round-rankings-kinchranks.53353/" target="_blank" rel="noopener noreferrer">
						original forum discussion from SpeedSolving.com
					</a>
					{" "}.
				</p>
				<p>
					In short:
				</p>
				<ul className="disc">
					<li>Higher scores are better</li>
					<li>Your score is relative to the top result only</li>
					<li>The record holder for an event and category scores 100</li>
					<li>Double the record scores 50</li>
				</ul>
				<p>
					One thing of note is that Kinch Ranks only considers averages for most events
					(excluding blindfold events and FMC) with the philosophy that outlier singles
					are not as useful for measuring overall performance.
				</p>
				<p>
					The Senior Kinch Ranks calculations use official WCA results from known senior competitors,
					thanks to the data collected and maintained by Michael George for the
					{" "}
					<a target="_blank" href="https://wca-seniors.org/" rel="noopener noreferrer">
						Senior Rankings
					</a>
					{" "}.
				</p>
			</div>
		</div>
	);
}
