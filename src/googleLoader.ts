import { Loader } from "@googlemaps/js-api-loader";

const googleLoader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["places", "geometry"]
});

export default googleLoader;
