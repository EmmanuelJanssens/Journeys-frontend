/* eslint-disable @typescript-eslint/no-unused-vars */
type User = {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
};

type UserRegister = {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

type Poi = {
    id: string;
    name: string;
    description?: string;
    location: {
        longitude: number;
        latitude: number;
    };
};

type PositionStackData = {
    latitude?: number;
    longitude?: number;
    label?: string;
    name?: string;
    type?: string;
    number?: string;
    street?: string;
    postal_code?: string;
    confidence?: number;
    region?: string;
    region_code?: string;
    administrative_area?: undefined;
    neighbourhood?: string;
    country?: string;
    country_code?: string;
    mapurl?: string;
};

type GeoJsonData = {
    type: string;
    crs: {
        type: string;
        properties: {
            name: string;
        };
    };
    features: GeoJsonPoi[];
};

type GeoJsonPoi = {
    type: string;
    geometry: {
        type: string;
        coordinates: number[];
    };
    properties: Poi;
    id?: string;
};

type Journey = {
    id: string;
    title: string;
    start: {
        latitude: number;
        longitude: number;
    };
    end: {
        latitude: number;
        longitude: number;
    };
    creator: {
        userName: string;
    };
};

type ApiAuthenticationResponse = {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    token: string;
};

type ApiError = {
    message: string;
};
