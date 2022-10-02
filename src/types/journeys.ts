export type User = {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
};

export type Poi = {
    id: string;
    name: string;
    description?: string;
    location: {
        latitude: number;
        longitude: number;
    };
};
export type GeocodedData = {
    address: string;
    coordinates: import("maplibre-gl").LngLat;
    error?: any;
};

export type PoiGeoJsonData = {
    type: string;
    crs: {
        type: string;
        properties: {
            name: string;
        };
    };
    features: PoiGeoJsonFormat[];
};

export type PoiGeoJsonFormat = {
    type: string;
    geometry: {
        type: string;
        coordinates: number[];
    };
    properties: Poi;
    id?: string;
};
export type Experience = {
    poi: Poi;
    experience: {
        description: string;
        date: Date;
        images: never[];
        order: number;
    };
};

export type Journey = {
    id?: string;
    title?: string;
    start?: {
        latitude: number;
        longitude: number;
    };
    end?: {
        latitude: number;
        longitude: number;
    };
    creator?: {
        userName: string;
    };
    experiences: Experience[];
};

export type ApiAuthenticationResponse = {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    token: string;
};

export type ApiError = {
    message: string;
};
