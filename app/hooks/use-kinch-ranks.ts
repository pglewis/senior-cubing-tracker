import {useMemo} from 'react';
import {useData} from './use-data';
import {
    type KinchRank,
    type KinchEvent,
    type TopRank,
    scoreAverageOnly
} from '@repo/common/types/kinch-types';
import type {
    ExtendedRankingsData,
    WCAEvent,
    EventRanking
} from '@repo/common/types/rankings-snapshot';
import {timeResultToSeconds, parseMultiResult} from '@repo/common/util/parse';

interface KinchFilters {
    age: string;
    region: string;
}

export function useKinchRanks(filters: KinchFilters): KinchRank[] {
    const {rankings, topRanks} = useData();

    return useMemo(() => {
        if (!rankings || !topRanks) {
            return [];
        }

        let allRanks = rankings.data.persons.map(p =>
            getRanksForPerson(rankings, topRanks, {
                age: filters.age,
                region: filters.region
            }, p.id)
        );
        allRanks = allRanks.filter(r => r.overall > 0);
        allRanks.sort((a, b) => b.overall - a.overall);

        return allRanks;
    }, [rankings, topRanks, filters.age, filters.region]);
}

function getRanksForPerson(
    rankings: ExtendedRankingsData,
    topRanks: TopRank[],
    filters: KinchFilters,
    personID: string
): KinchRank {
    const rankingsData = rankings.data;
    const person = rankingsData.persons.find(p => p.id === personID);
    if (!person) {
        throw new Error(`We were looking for someone's rankings but WCA ID "${personID}" was not found.`);
    }

    const kinchRank: KinchRank = {
        personID: personID,
        personName: person.name,
        overall: 0,
        events: [] as KinchEvent[]
    };

    const country = rankingsData.countries[rankings.countryIDToIndex[person.country]];
    const continent = rankingsData.continents[rankings.continentIDToIndex[country.continent]];
    if (filters.region !== "world" && filters.region !== country.id && filters.region !== continent.id) {
        return kinchRank;
    }

    for (const event of rankingsData.events) {
        if (!person.events.includes(event.id)) {
            // They've never competed in this event at all
            kinchRank.events.push({
                eventID: event.id,
                eventName: event.name,
                score: 0,
                result: "",
                type: null,
            });
        } else if (event.id === "333mbf") {
            // Multi blind is a special case
            kinchRank.events.push(getPersonMultiScore(topRanks, personID, event, filters));
        } else if (scoreAverageOnly[event.id]) {
            // Use the average
            kinchRank.events.push(getPersonAverageScore(topRanks, personID, event, filters));
        } else {
            // best of single or average
            kinchRank.events.push(getPersonSingeleOrAverageScore(topRanks, personID, event, filters));
        }
    }

    kinchRank.overall = kinchRank.events.reduce((acc, current) => acc + current.score, 0) / kinchRank.events.length;
    return kinchRank;
}

function getTopRank(
    topRanks: TopRank[],
    eventID: string,
    type: EventRanking["type"],
    filters: KinchFilters
): TopRank | undefined {
    const topRank = topRanks.find(r =>
        r.eventID === eventID
        && r.type === type
        && r.age === Number(filters.age)
        && r.region === filters.region
    );

    return topRank;
}

function getPersonResult(
    event: WCAEvent,
    type: EventRanking["type"],
    personID: string,
    filters: KinchFilters
): string | undefined {
    const eventRanking = event.rankings.find(
        r => r.type === type
            && r.age === Number(filters.age)
    );

    if (!eventRanking) {
        return undefined;
    }

    const rank = eventRanking.ranks.find(r => r.id === personID);
    if (!rank) {
        return undefined;
    }

    return rank.best;
}

function getPersonAverageScore(
    topRanks: TopRank[],
    personID: string,
    event: WCAEvent,
    filters: KinchFilters
): KinchEvent {
    const topRank = getTopRank(topRanks, event.id, "average", filters);
    const result = getPersonResult(event, "average", personID, filters);

    if (!result || !topRank) {
        return {
            eventID: event.id,
            eventName: event.name,
            score: 0,
            result: "",
            type: null,
        };
    }

    return {
        eventID: event.id,
        eventName: event.name,
        score: getPersonScore(event.format, topRank, result),
        result: result,
        type: "average",
    };
}

function getPersonSingeleOrAverageScore(
    topRanks: TopRank[],
    personID: string,
    event: WCAEvent,
    filters: KinchFilters
): KinchEvent {
    const singleTopRank = getTopRank(topRanks, event.id, "single", filters);
    const averageTopRank = getTopRank(topRanks, event.id, "average", filters);
    const singleResult = getPersonResult(event, "single", personID, filters);
    const averageResult = getPersonResult(event, "average", personID, filters);

    if (!singleResult || !singleTopRank) {
        // We can end up here if they've competed in the event but not in this age bracket
        return {
            eventID: event.id,
            eventName: event.name,
            score: 0,
            result: "",
            type: null,
        };
    }

    let result: string;
    let score = 0;
    let type: KinchEvent["type"];
    const singleScore = getPersonScore(event.format, singleTopRank, singleResult);
    if (averageResult && averageTopRank) {
        const averageScore = getPersonScore(event.format, averageTopRank, averageResult);

        // They have both a single and average, pick the best score of the two
        if (singleScore > averageScore) {
            score = singleScore;
            result = singleResult;
            type = "single";
        } else {
            score = averageScore;
            result = averageResult;
            type = "average";
        }
    } else {
        score = singleScore;
        result = singleResult;
        type = "single";
    }

    return {
        eventID: event.id,
        eventName: event.name,
        score: score,
        result: result,
        type: type,
    };
}

function getPersonScore(
    format: WCAEvent["format"],
    topRank: TopRank,
    result: string
) {
    if (format === "time") {
        return (timeResultToSeconds(topRank.result) / timeResultToSeconds(result)) * 100;
    } else {
        return (Number(topRank.result) / Number(result)) * 100;
    }
}

function getPersonMultiScore(
    topRanks: TopRank[],
    personID: string,
    event: WCAEvent,
    filters: KinchFilters
): KinchEvent {
    const topRank = getTopRank(topRanks, event.id, "single", filters); // We just use single for mbld
    const result = getPersonResult(event, "single", personID, filters);

    if (!result || !topRank) {
        return {
            eventID: event.id,
            eventName: event.name,
            score: 0,
            result: "",
            type: null,
        };
    }

    // Bigger result is better for mbld, so the division is reversed
    return {
        eventID: event.id,
        eventName: event.name,
        score: (getKinchMultiScore(result) / getKinchMultiScore(topRank.result)) * 100,
        result: result,
        type: "single",
    };
}

function getKinchMultiScore(result: string) {
    const multiResult = parseMultiResult(result);
    return multiResult.score + 1 - multiResult.seconds / (60 * 60);
}