import { ref } from "vue";

class JourneyModalController {
    private _open = ref();

    private _modals = ref<Map<string, boolean>>();

    constructor() {
        this._modals.value = new Map();
    }

    create(modal: string) {
        this._modals.value?.set(modal, false);
    }
    open(modal: string): void {
        if (this._modals.value?.get(modal) != undefined) this._modals.value?.set(modal, true);
        console.log(this._modals);
    }

    close(modal: string): void {
        this._modals.value?.set(modal, false);
    }
    async closeAsync(callback: () => Promise<void>): Promise<void> {
        await callback();
        this._open.value = false;
    }
    isOpen(modal: string): boolean | undefined {
        return this._modals.value?.get(modal);
    }
}

export const journeyModalController = new JourneyModalController();
