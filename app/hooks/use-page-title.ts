import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
    '/': 'Senior Cubing Tracker',
    '/recent': 'Recent Senior Records',
    '/kinch-ranks': 'Senior Kinch Ranks',
    '/results': 'Senior Results'
};

export function usePageTitle() {
    const location = useLocation();
    return titles[location.pathname] || 'Senior Cubing Tracker';
}