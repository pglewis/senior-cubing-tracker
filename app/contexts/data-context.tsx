import {useState, useEffect} from "react";
import type {ExtendedRankingsData} from "@repo/common/types/rankings-snapshot";
import type {TopRank} from "@repo/common/types/kinch-types";
import {DataContext} from "./data-instance";

export function DataProvider({children}: {children: React.ReactNode;}) {
	const [rankings, setRankings] = useState<ExtendedRankingsData | null>(null);
	const [topRanks, setTopRanks] = useState<TopRank[] | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function loadData() {
			try {
				const [rankingsRes, topRanksRes] = await Promise.all([
					fetch("/data/senior-rankings.json"),
					fetch("/data/topranks.json")
				]);

				if (!rankingsRes.ok || !topRanksRes.ok) {
					throw new Error("Failed to fetch data");
				}

				const [rankingsData, topRanksData] = await Promise.all([
					rankingsRes.json(),
					topRanksRes.json()
				]);

				setRankings(rankingsData);
				setTopRanks(topRanksData);
			} catch (err) {
				setError(err instanceof Error ? err : new Error("Unknown error"));
			} finally {
				setIsInitializing(false);
			}
		}

		void loadData();
	}, []);

	return (
		<DataContext.Provider value={{rankings, topRanks, isInitializing, error}}>
			{children}
		</DataContext.Provider>
	);
}