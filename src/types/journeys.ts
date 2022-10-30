import { LngLat } from "mapbox-gl";

export type User = {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
};

export type GeocodedData = {
    address: string;
    coordinates: LngLat;
    error?: any;
};

export type JourneyLocation = {
    address: string;
    coordinates: LngLat;
    isOk: boolean;
    error?: any;
};

export type ApiAuthenticationResponse = {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    token: string;
};

export type ApiError = {
    message: string;
};
