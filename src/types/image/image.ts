interface IJourneyImage {
    id: string;
    url: string;
    thumbnail: string;
}

export type JourneyImage = Required<IJourneyImage>;
