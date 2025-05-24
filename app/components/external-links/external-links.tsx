import styles from './external-links.module.css';

export function ExternalLinks() {
    return (
        <div className={styles.links}>
            <dl>
                <dt>
                    <a
                        target="_blank"
                        rel="noopener"
                        href="https://wca-seniors.org/"
                    >
                        Senior Rankings (WCA Seniors)
                    </a>
                </dt>
                <dd>
                    Michael George's senior rankings data is the foundation of this site, it would be impossible
                    without his ongoing efforts to compile and maintain official ranking data for competitors over 40.

                    Here you can find:
                    <ul className={styles.list}>
                        <li>
                            The <a href="https://wca-seniors.org/Registration.html" target="_blank" rel="noopener">
                                registration page
                            </a> to opt-in to the senior rankings
                        </li>
                        <li>
                            The full <a href="https://wca-seniors.org/Senior_Rankings.html" target="_blank" rel="noopener">
                                Senior Rankings
                            </a> list
                        </li>
                        <li>
                            <a href="https://wca-seniors.org/Recent_Competitions.html" target="_blank" rel="noopener">
                                Recent Competitions
                            </a> with 40+ competitors
                        </li>
                        <li>
                            <a href="https://wca-seniors.org/Future_Competitions.html" target="_blank" rel="noopener">
                                Future Competitions
                            </a> with 40+ competitors
                        </li>
                    </ul>
                </dd>
            </dl>

            <dl>
                <dt>
                    <a
                        href="https://www.facebook.com/groups/1604105099735401"
                        target="_blank"
                        rel="noopener"
                    >
                        Senior Cubers Worldwide
                    </a>
                </dt>
                <dd>
                    Facebook group focused on competitors over 40 (all cubers are welcome). Weekly video competitions,
                    daily scrambles, daily challenges, and more.
                </dd>
            </dl>

            <dl>
                <dt>
                    <a
                        href="https://www.speedsolving.com/threads/older-cubers-discussions.37405/"
                        target="_blank"
                        rel="noopener"
                    >
                        Older cubers discussions forum thread on SpeedSolving.com
                    </a>
                </dt>
                <dd>
                    This is where it all started.
                </dd>
            </dl>
        </div>
    );
}