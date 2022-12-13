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
    creator?: string;
    visibility?: "public" | "private";
    experiencesAggregate?: { count: number };
    experiences?: Array<{
        experience: Experience;
        poi: PointOfInterest;
    }>;

    thumbnails?: string[];
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
    updated?: Array<{
        experience: Experience;
        poi: PointOfInterest;
    }>;
    deleted?: Array<String>;
    connected?: Array<{
        experience: Experience;
        poi: PointOfInterest;
    }>;
};
