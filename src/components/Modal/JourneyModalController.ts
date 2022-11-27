import { ref } from "vue";

class JourneyModalController {
    private _open = ref();

    open(): void {
        this._open.value = true;
    }

    close(): void {
        this._open.value = false;
    }
    async closeAsync(callback: () => Promise<void>): Promise<void> {
        await callback();
        this._open.value = false;
    }
    isOpen(): boolean {
        return this._open.value;
    }
}

export const journeyModalController = new JourneyModalController();
