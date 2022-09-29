<template>
    <ion-modal ref="modal" trigger="open-register-modal">
        <ion-content class="journey-login-modal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Login</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="floating">Username</ion-label>
                            <ion-input type="text" />
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-item>
                            <ion-label position="floating">Password</ion-label>
                            <ion-input type="password" />
                        </ion-item>
                    </ion-col>
                </ion-row>
                <ion-row
                    class="ion-align-items-center ion-justify-content-center">
                    <ion-col size="2">
                        <ion-button color="primary">login</ion-button>
                    </ion-col>
                    <ion-col size="2">
                        <ion-button color="secondary">cancel</ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-modal>
</template>

<script lang="ts">
import {
    IonModal,
    IonInput,
    IonGrid,
    IonCol,
    IonRow,
    IonButton,
    IonItem,
    IonLabel,
    IonHeader,
    IonToolbar
} from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
    components: {
        IonModal,
        IonInput,
        IonGrid,
        IonCol,
        IonRow,
        IonButton,
        IonItem,
        IonLabel,
        IonHeader,
        IonToolbar
    },
    methods: {
        dismiss() {
            (this.$refs as typeof IonModal).modal.$el.dismiss();
        }
    }
});
</script>
