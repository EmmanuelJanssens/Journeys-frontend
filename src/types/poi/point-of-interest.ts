import { JourneyImage } from "types/image/image";

interface IPointOfInterest {
    id: string;
    name: string;
    location: {
        longitude: number;
        latitude: number;
    };
    tags: string[];
    thumbnails: JourneyImage[];
    experiencesAggregate: {
        expCount: number;
    };
}

export type PointOfInterest = Required<IPointOfInterest>;
