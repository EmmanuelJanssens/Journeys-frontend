import { LngLat } from "maplibre-gl";
import googleLoader from "google/googleLoader";
import { GeocodedData } from "types/journeys";

let googleGeocoder: google.maps.Geocoder;

googleLoader.load().then((google) => {
    googleGeocoder = new google.maps.Geocoder();
});

async function getGeocodedData(value: string): Promise<GeocodedData> {
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

async function reverseGeocode(
    lat: number,
    lng: number
): Promise<google.maps.GeocoderResult | undefined> {
    const request: google.maps.GeocoderRequest = {
        location: {
            lat,
            lng
        }
    };
    const result = await googleGeocoder.geocode(request);

    if (result.results[0]) {
        return result.results[0];
    } else {
        return undefined;
    }
}

function getLocalityAndCountry(results: google.maps.GeocoderResult): {
    locality: string;
    country: string;
} {
    const result = results.address_components.filter(
        (f) => f.types.includes("locality") || f.types.includes("country")
    );
    return {
        locality: result[0].long_name,
        country: result[1].long_name
    };
}
export { getGeocodedData, reverseGeocode, getLocalityAndCountry };
