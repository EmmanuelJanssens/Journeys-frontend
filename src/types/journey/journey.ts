import { Experience } from "types/experience/experience";
import { JourneyImage } from "types/image/image";

export interface Journey {
    id: string;
    title: string;
    description: string;
    start: {
        longitude: number;
        latitude: number;
    };
    end: {
        longitude: number;
        latitude: number;
    };
    visibility: "public" | "private";
    experiences: Experience[];
    thumbnail: JourneyImage;
    thumbnails: JourneyImage[];
    creator: string;
}

//partial type for patching a journey
export type UpdateJourney = Partial<Pick<Journey, "title" | "description" | "visibility">> & {
    thumbnail?: string;
};

export type CreateJourney = Pick<Journey, "id" | "title" | "description" | "visibility" | "start" | "end">;
// export default class Journey {
//     private _id: string;
//     private _title: string;
//     private _description: string;
//     private _start: {
//         longitude: number;
//         latitude: number;
//     };
//     private _end: {
//         longitude: number;
//         latitude: number;
//     };
//     private _experiences: Experience[];
//     private _thumbnail: JourneyImage;
//     private _creator: string;

//     constructor(
//         id: string,
//         title: string,
//         description: string,
//         start: { longitude: number; latitude: number },
//         end: { longitude: number; latitude: number },
//         thumbnail: JourneyImage,
//         creator: string,
//         experiences: Experience[]
//     ) {
//         this._id = id;
//         this._title = title;
//         this._description = description;
//         this._start = start;
//         this._end = end;
//         this._thumbnail = thumbnail;
//         this._creator = creator;
//         this._experiences = experiences;
//     }

//     get id(): string {
//         return this._id;
//     }

//     set id(id: string) {
//         this._id = id;
//     }

//     get title(): string {
//         return this._title;
//     }

//     set title(title: string) {
//         this._title = title;
//     }

//     get description(): string {
//         return this._description;
//     }

//     set description(description: string) {
//         this._description = description;
//     }

//     get start(): { longitude: number; latitude: number } {
//         return this._start;
//     }

//     set start(start: { longitude: number; latitude: number }) {
//         this._start = start;
//     }

//     get end(): { longitude: number; latitude: number } {
//         return this._end;
//     }

//     set end(end: { longitude: number; latitude: number }) {
//         this._end = end;
//     }

//     get thumbnail(): JourneyImage {
//         return this._thumbnail;
//     }

//     set thumbnail(thumbnail: JourneyImage) {
//         this._thumbnail = thumbnail;
//     }

//     get creator(): string {
//         return this._creator;
//     }

//     set creator(creator: string) {
//         this._creator = creator;
//     }

//     get experiences(): Experience[] {
//         return this._experiences;
//     }

//     set experiences(experiences: Experience[]) {
//         this._experiences = experiences;
//     }

//     public addExperience(experience: Experience) {
//         this._experiences.push(experience);
//     }

//     public removeExperience(experience: Experience) {
//         this._experiences = this._experiences.filter((e) => e.id !== experience.id);
//     }

//     public updateExperience(experience: Experience) {
//         this._experiences = this._experiences.map((e) => {
//             if (e.id === experience.id) {
//                 return experience;
//             }
//             return e;
//         });
//     }

//     public getExperience(id: string): Experience | undefined {
//         return this._experiences.find((e) => e.id === id);
//     }

//     public getExperiences(): Experience[] {
//         return this._experiences;
//     }

//     public getJourneyMidPoint(journey: Journey): {
//         center: LngLat;
//         radius: number;
//     } {
//         const start = new LngLat(journey.start?.longitude!, journey.start?.latitude!);
//         const end = new LngLat(journey.end?.longitude!, journey.end?.latitude!);
//         const center = getMidPoint(start, end);

//         const radius = getRadius(start, end);
//         return { center: new LngLat(center.lng, center.lat), radius };
//     }
// }
