export type SearchPoiDto = {
    lat: number;
    lng: number;
    radius: number;
    page?: number;
    pageSize?: number;
};

export type PoiDto = {
    id: string;
    name: string;
    location: LocationDto;
    experiences?: ExperienceDto[];
    thumbnail?: string;
};

export type LocationDto = {
    latitude: number;
    longitude: number;
};

export type ExperienceDto = {
    poi: PoiDto;
    experience: {
        title: string;
        description: string;
        order: number;
        images: string[];
        date: string;
    };
    journey?: JourneyDto;
    id?: string;
};

export type AddressDto = {
    address: string;
    latitude: number;
    longitude: number;
};

export type UpdateJourneyDto = {
    journey?: JourneyDto;
    updated?: ExperienceDto[];
    deleted?: {
        poi_ids: string[];
    };
    connected?: {
        experience: ExperienceDto;
    }[];
};

export type JourneyDto = {
    id?: string;
    title?: string;
    description?: string;
    start?: AddressDto;
    end?: AddressDto;
    creator?: UserDto;
    experiences?: ExperienceDto[];
};

export type UserDto = {
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    token?: string;
};
