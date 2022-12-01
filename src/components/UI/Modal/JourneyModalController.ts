import { Component, markRaw, ref } from "vue";

class JourneyModalController {
    private _modals = ref<Map<string, { component: Component; open: boolean }>>();

    private _props = ref();

    private _close = ref();
    constructor() {
        this._modals.value = new Map();
    }

    create(modal: string, component: any) {
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

    async close(modal: string, data?: { data: any }) {
        if (this._modals.value?.get(modal) != undefined) this._modals.value.get(modal)!.open = false;
        this._close.value = data;
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

    checkClose(param: { component: Component; open: boolean }, resolve: (data: any) => void) {
        if (param.open) {
            setTimeout(() => {
                this.checkClose(param, resolve);
            }, 500);
        } else {
            resolve(this._close.value);
        }
    }
    async didClose(modal: string) {
        const promise = new Promise<any>((resolve) => {
            this.checkClose(this._modals.value?.get(modal)!, resolve);
        });

        return promise;
    }
    getOpen() {
        let openComp;
        this._modals.value?.forEach((v) => {
            if (v.open) openComp = v.component;
        });
        return openComp;
    }
}

export const journeyModalController = new JourneyModalController();
