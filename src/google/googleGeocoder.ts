import googleLoader from "google/googleLoader";
import { AddressDto } from "types/dtos";

let googleGeocoder: google.maps.Geocoder;

googleLoader.load().then((google) => {
    googleGeocoder = new google.maps.Geocoder();
});

async function getGeocodedData(value: string): Promise<AddressDto> {
    const request: google.maps.GeocoderRequest = {
        address: value,
        componentRestrictions: { country: "ch" }
    };
    const response = await googleGeocoder
        .geocode(request)
        .then((response) => {
            return {
                placeId: response.results[0].place_id,
                address: value,
                longitude: response.results[0].geometry.location.lng(),
                latitude: response.results[0].geometry.location.lat()
            };
        })
        .catch((error) => {
            return {
                placeId: "",
                address: value,
                latitude: -1,
                longitude: -1,
                error
            };
        });
    return response;
}

async function reverseGeocode(lat: number, lng: number): Promise<google.maps.GeocoderResult | undefined> {
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
    placeId: string;
    locality: string;
    country: string;
} {
    const result = results.address_components.filter(
        (f) => f.types.includes("locality") || f.types.includes("country") || f.types.includes("postal_code")
    );
    return {
        locality: result[0].long_name,
        country: result[1].long_name,
        placeId: results.place_id
    };
}
export { getGeocodedData, reverseGeocode, getLocalityAndCountry };
