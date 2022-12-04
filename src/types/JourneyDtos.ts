import { type } from "os";

export type User = {
    uid?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    token?: string;
    public?: boolean;
    citation?: string;
    banner?: string[];
    journeysAggregate?: {
        count: number;
    };
    journeysConnection?: {
        edges: [{ node: { experiencesAggregate: { count: number } } }];
    };
};

export type Locality = {
    longitude: number;
    latitude: number;
};

export type Experience = {
    title?: string;
    description?: string;
    images?: string[];
    imagesToUpload?: any[];
    date: string;
};
export type PointOfInterest = {
    id?: string;
    name: string;
    location: Locality;
    journeys?: Array<Journey>;
    experiences?: Array<Experience>;
    tags?: string[];
};

export type Journey = {
    id?: string;
    title?: string;
    start?: Locality;
    end?: Locality;
    description?: string;
    thumbnail?: string;
    visibility?: "public" | "private";

    experiences?: Array<{
        data: Experience;
        poi: PointOfInterest;
    }>;
    creator?: string;
};

export type UpdateJourneyDto = {
    journey?: Journey;
    updated?: Array<{
        data: Experience;
        poi: PointOfInterest;
    }>;
    deleted?: Array<String>;
    connected?: Array<{
        data: Experience;
        poi: PointOfInterest;
    }>;
};
