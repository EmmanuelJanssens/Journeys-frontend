import mapboxgl from "mapbox-gl";

export type SearchPoiDto = {
    lat: number;
    lng: number;
    radius: number;
    page?: number;
    pageSize?: number;
};

export type PoiDto = {
    id?: string;
    name?: string;
    location?: LocationDto;
    journeysConnection?: {
        edges: ExperienceDto[];
    };
    thumbnail?: string;
};

export type LocationDto = {
    latitude: number;
    longitude: number;
};

export type ExperienceDto = {
    editing?: boolean;
    imagesEditing?: any[];
    title: string;
    description: string;
    order: number;
    images: string[];
    date: string;
    node: PoiDto | JourneyDto | UserDto;
};

export type AddressDto = {
    placeId: string;
    address: string;
    latitude: number;
    longitude: number;
    error?: string;
};

export function getAddressCoordinates(address: AddressDto): mapboxgl.LngLat {
    return new mapboxgl.LngLat(address.longitude, address.latitude);
}

export type UpdateJourneyDto = {
    updated?: ExperienceDto[];
    deleted?: {
        poi_ids: string[];
    };
    connected?: ExperienceDto[];
};

export type JourneyDto = {
    id?: string;
    title?: string;
    description?: string;
    start?: AddressDto;
    end?: AddressDto;
    creator?: UserDto;
    thumbnail?: string;
    experienceCount?: number;
    experiencesAggregate?: { count: number };
    experiencesConnection?: {
        edges: ExperienceDto[] | undefined;
    };
};

export type UserDto = {
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
