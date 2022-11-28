import { Component, markRaw, ref } from "vue";

class JourneyModalController {
    private _modals = ref<Map<string, { component: Component; open: boolean }>>();

    private _props = ref();
    constructor() {
        this._modals.value = new Map();
    }

    create(modal: string, component: any) {
        console.log(component);
        this._modals.value?.set(modal, {
            component: markRaw(component),
            open: false
        });
    }
    open(modal: string, options?: { props: any }): void {
        this._modals.value?.get(modal)?.component;
        this._props = options?.props;
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
    get(modal: string) {
        return this._modals.value?.get(modal)?.component;
    }
    getProps() {
        return this._props;
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
