import type {ExtendedRankingsData} from '@repo/common/types/rankings-snapshot';
import type {TopRank} from '@repo/common/types/kinch-types';

export interface DataContextType {
    rankings: ExtendedRankingsData | null;
    topRanks: TopRank[] | null;
    isInitializing: boolean;
    error: Error | null;
}