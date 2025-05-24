import { Outlet } from 'react-router-dom';
import { KofiButton } from "./kofi-button";
import { MainNav } from "../navigation/main-nav";
import { usePageTitle } from '../../hooks/use-page-title';
import styles from './page-layout.module.css';

export function PageLayout() {
    const title = usePageTitle();

    return (
        <>
            <header className={styles.header}>
                <MainNav />
                <h2>{title}</h2>
            </header>
            <main className={styles.container}>
                <Outlet />
            </main>
            <footer className={styles.footer}>
                <hr />
                <KofiButton />
                <p>Powered by pizza and beer</p>
            </footer>
        </>
    );
}
