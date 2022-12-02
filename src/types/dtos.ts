import { User } from "firebase/auth";
import mapboxgl from "mapbox-gl";

export type AddressDto = {
    placeId: string;
    address: string;
    latitude: number;
    longitude: number;
    error?: string;
};
