import { Experience } from "./journeys";

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
    experiences?: ExperienceDto[];
};

export type LocationDto = {
    latitude: number;
    longitude: number;
};

export type ExperienceDto = {
    poi: PoiDto;
    experience: {
        description: string;
        order: number;
        images: string[];
        date: Date;
    };
};

export type AddressDto = {
    address: string;
    latitude: number;
    longitude: number;
};
export type JourneyDto = {
    id?: string;
    title?: string;
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
