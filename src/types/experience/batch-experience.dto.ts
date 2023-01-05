import { CreateExperience, Experience, UpdateExperience } from "./experience";

export class BatchExperience {
    private _connected: CreateExperience[];
    private _deleted: string[];
    private _updated: UpdateExperience[];

    constructor(updated: UpdateExperience[]) {
        this._connected = [];
        this._deleted = [];
        this._updated = updated;
    }

    get connected(): CreateExperience[] {
        return this._connected;
    }

    get updated(): UpdateExperience[] {
        return this._updated;
    }

    get deleted(): string[] {
        return this._deleted;
    }

    connect(experience: CreateExperience) {
        if (
            this._connected.find((e) => e.poi.id === experience.poi.id) ||
            this._updated.find((e) => e.poi!.id === experience.poi.id)
        ) {
            return;
        }
        this._connected.push(experience);
        console.log(this._connected);
        console.log(this._updated);
        console.log(this._deleted);
    }

    remove(experience: string) {
        this._deleted.push(experience);
    }

    update(experience: UpdateExperience) {
        this._updated.push(experience);
    }

    addConnectedImage(image: string, experienceId: string) {
        const index = this._connected.findIndex((exp) => exp.id === experienceId);
        this._connected[index].addedImages.push(image);
    }

    removeConnectedImage(image: string, experienceId: string) {
        const index = this._connected.findIndex((exp) => exp.id === experienceId);
        this._connected[index].addedImages = this._connected[index].addedImages.filter((img) => img !== image);
    }

    removeConnected(experienceId: string) {
        if (this._connected.findIndex((exp) => exp.id === experienceId) > -1)
            this._connected = this._connected.filter((exp) => exp.id !== experienceId);
        else if (this._updated.findIndex((exp) => exp.id === experienceId) > -1) {
            this._updated = this._updated.filter((exp) => exp.id !== experienceId);
            this._deleted.push(experienceId);
        }
    }

    removeRemoved(experienceId: string) {
        this._deleted = this._deleted.filter((exp) => exp !== experienceId);
    }

    removeUpdated(experienceId: string) {
        this._updated = this._updated.filter((exp) => exp.id !== experienceId);
    }
}
