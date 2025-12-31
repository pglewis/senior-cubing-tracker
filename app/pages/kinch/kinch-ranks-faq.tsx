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
					<li>Your event score is relative to the top result only</li>
					<li>The record holder for an event and category scores 100</li>
					<li>Twice the record time scores 50</li>
				</ul>
				<p>
					Kinch Ranks only considers averages for most events with the philosophy
					that outlier singles are not as useful for measuring overall performance.
				</p>
				<p>
					FM and blind events are exceptions where both single and average (where applicable)
					will be considered, using whichever scores higher. Note that this can result in
					two competitors scoring 100 for the same event.
					<blockquote>
						For 3bld and FM, the average rankings are not yet established enough, so single
						ranks are allowed to be used instead if advantageous for a person. FM may be
						restricted to averages only in the future if the rankings reach a good point to
						do that.
					</blockquote>
				</p>
				<p>
					Multi-blind scoring has special handling:
					<blockquote>
						For multibld, your result is adjusted to a single number Points + ProportionofHourLeft.
						[...] Someone with e.g. 11 points in 45:00 would get (11+0.25)/41.0961 = 0.2737. This
						calculation  ensures that more points always equals a better score, no matter the time
						spent.  Less time spent still gives a better <score className=""></score>
					</blockquote>
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
		</div >
	);
}
