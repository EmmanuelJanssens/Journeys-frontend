import { LngLat } from "maplibre-gl";
import googleLoader from "./googleLoader";

let googleGeocoder: google.maps.Geocoder;

googleLoader.load().then((google) => {
    googleGeocoder = new google.maps.Geocoder();
});

async function getGeocodedData(value: string): Promise<{
    address: string;
    coordinates: LngLat;
    error?: any;
}> {
    const request: google.maps.GeocoderRequest = {
        address: value,
        componentRestrictions: { country: "ch" }
    };
    const response = await googleGeocoder
        .geocode(request)
        .then((response) => {
            return {
                address: value,
                coordinates: new LngLat(
                    response.results[0].geometry.location.lng(),
                    response.results[0].geometry.location.lat()
                )
            };
        })
        .catch((error) => {
            return {
                address: value,
                coordinates: new LngLat(-1, -1),
                error
            };
        });
    return response;
}

export { getGeocodedData };
