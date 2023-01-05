import { JourneyImage } from "types/image/image";
import { PointOfInterest } from "types/poi/point-of-interest";

interface IExperience {
    id: string;
    title: string;
    description: string;
    date: string;
    images: JourneyImage[];
    poi: PointOfInterest;
}
export type Experience = Required<IExperience>;

export type UpdateExperience = Partial<Pick<IExperience, "id" | "title" | "description" | "date" | "images">> & {
    poi?: PointOfInterest;
    addedImages: string[];
    removedImages: string[];
};

export type CreateExperience = Partial<Pick<IExperience, "id" | "title" | "description" | "date">> & {
    poi: PointOfInterest;
    addedImages: string[];
};

export function isExperience(experience: Experience | CreateExperience): experience is Experience {
    return (experience as Experience).id === undefined;
}
