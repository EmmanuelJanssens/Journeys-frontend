import { modalController, toastController } from "@ionic/vue";
import haversine from "haversine";

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
        keyboardClose: false,
        backdropDismiss: false
    });
    await modal.present();
    return modal;
}

export function getMidPoint(start: mapboxgl.LngLat, end: mapboxgl.LngLat) {
    const lat1 = (start.lat * Math.PI) / 180;
    const lon1 = (start.lng * Math.PI) / 180;
    const X1 = Math.cos(lat1) * Math.cos(lon1);
    const Y1 = Math.cos(lat1) * Math.sin(lon1);
    const Z1 = Math.sin(lat1);

    const lat2 = (end.lat * Math.PI) / 180;
    const lon2 = (end.lng * Math.PI) / 180;
    const X2 = Math.cos(lat2) * Math.cos(lon2);
    const Y2 = Math.cos(lat2) * Math.sin(lon2);
    const Z2 = Math.sin(lat2);

    const x = (X1 + X2) / 2;
    const y = (Y1 + Y2) / 2;
    const z = (Z1 + Z2) / 2;

    let lon = Math.atan2(y, x);
    const hyp = Math.sqrt(x * x + y * y);
    let lat = Math.atan2(z, hyp);
    lat = (lat * 180) / Math.PI;
    lon = (lon * 180) / Math.PI;

    return {
        lat: lat,
        lng: lon
    };
}

export function getRadius(start: mapboxgl.LngLat, end: mapboxgl.LngLat): number {
    const r = haversine(
        {
            latitude: start.lat,
            longitude: start.lng
        },
        {
            latitude: end.lat,
            longitude: end.lng
        },
        { unit: "meter" }
    );
    return r / 2;
}
