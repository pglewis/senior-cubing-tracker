import { Outlet } from 'react-router-dom';
import { KofiButton } from "./kofi-button";
import styles from './page-layout.module.css';

export function PageLayout() {
    return (
        <div className={styles.container}>
            <h2>Senior Cubing Tracker</h2>
            <Outlet />
            <footer className={styles.footer}>
                <hr />
                <KofiButton />
                <p>Powered by pizza and beer</p>
            </footer>
        </div>
    );
}
