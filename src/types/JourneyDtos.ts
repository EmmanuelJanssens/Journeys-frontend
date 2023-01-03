export type User = {
    uid?: string;
    email?: string;
    password?: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    visibility?: "private" | "public";
    journeysAggregate?: {
        count: number;
    };
    poisAggregate?: { count: number };
};

export type Locality = {
    longitude: number;
    latitude: number;
};

export type Image = {
    id: string;
    original: string;
    thumbnail: string;
};

export type Experience = {
    id?: string;
    title?: string;
    description?: string;
    images: Image[] | string[];
    addedImages?: string[];
    removedImages?: string[];
    poi?: PointOfInterest | string;
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
    thumbnail?: Image;
    creator?: string;
    visibility?: "public" | "private";
    experiencesAggregate?: { count: number };
    experiences: Experience[];

    thumbnails?: Image[];
};

export type PagedJourneys = {
    total?: number;
    totalExperiences?: number;
    journeys: Journey[];
    pageInfo?: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
    };
};

export type UpdateJourneyDto = {
    updated: Array<{
        experience: Experience;
    }>;
    deleted: Array<String>;
    connected: Array<{
        experience: Experience;
    }>;
};
