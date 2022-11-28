import { Component, markRaw, ref } from "vue";

class JourneyModalController {
    private _modals = ref<Map<string, { component: any; open: boolean }>>();

    constructor() {
        this._modals.value = new Map();
    }

    create(modal: string, component: any) {
        this._modals.value?.set(modal, {
            component: markRaw(component),
            open: false
        });
    }
    open(modal: string): void {
        if (this._modals.value?.get(modal) != undefined) this._modals.value.get(modal)!.open = true;
    }

    close(modal: string): void {
        if (this._modals.value?.get(modal) != undefined) this._modals.value.get(modal)!.open = false;
    }
    async closeAsync(callback: () => Promise<void>): Promise<void> {
        await callback();
    }
    isOpen(modal: string): boolean | undefined {
        return this._modals.value?.get(modal)?.open;
    }

    getOpen() {
        let openComp;
        this._modals.value?.forEach((v) => {
            if (v.open) openComp = v.component;
        });
        return openComp;
    }
    onOpened(callback: () => {}) {}
}

export const journeyModalController = new JourneyModalController();
