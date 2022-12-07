import { type } from "os";
import { Component, markRaw, ref } from "vue";

export type ModalType =
    | "register"
    | "login"
    | "alert"
    | "editJourney"
    | "createJourney"
    | "editExperience"
    | "saveJourney"
    | "createPoi"
    | "updateUser";

class JourneyModalController {
    private _modals = ref<Map<string, { component: Component; open: boolean }>>();
    private _props = ref();
    private _close = ref();

    constructor() {
        this._modals.value = new Map();
    }

    create(modal: ModalType, component: any) {
        this._modals.value?.set(modal, {
            component: markRaw(component),
            open: false
        });
    }

    open(modal: ModalType, options?: { props: any }): void {
        this._modals.value?.get(modal)?.component;
        this._props = options?.props;
        if (this._modals.value?.get(modal) != undefined) this._modals.value.get(modal)!.open = true;
    }

    async close(modal: ModalType, data?: { data: any }) {
        if (this._modals.value?.get(modal) != undefined) this._modals.value.get(modal)!.open = false;
        this._close.value = data;
    }

    async closeAsync(callback: () => Promise<void>): Promise<void> {
        await callback();
    }

    isOpen(modal: ModalType): boolean | undefined {
        return this._modals.value?.get(modal)?.open;
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

    async didClose(modal: ModalType) {
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

//single instance for the project
export const journeyModalController = new JourneyModalController();
