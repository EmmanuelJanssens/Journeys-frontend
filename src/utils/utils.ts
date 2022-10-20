import { modalController, toastController } from "@ionic/vue";

export async function showToast(message: string, color: string) {
    const toast = await toastController.create({
        message: message,
        duration: 5000,
        position: "top",
        color: color,
        buttons: [
            {
                text: "Dismiss",
                role: "cancel",
                handler: () => {}
            }
        ]
    });
    await toast.present();
}

export async function openModal(component: any, props?: any) {
    const modal = await modalController.create({
        component: component,
        componentProps: props,
        keyboardClose: false
    });
    modal.present();
}
