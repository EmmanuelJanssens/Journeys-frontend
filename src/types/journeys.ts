import { LngLat } from "maplibre-gl";
import { string } from "yargs";
import { PoiDto } from "./dtos";

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
    properties: PoiDto;
    id: string;
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
