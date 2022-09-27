<template>
  <ion-menu menuId="profileMenu" content-id="main-content" type="overlay" side="end">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{userStore.userRef.userName}}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
          <ion-button color="primary" @click="closeMenu">
            Hide
          </ion-button>
    </ion-content>
  </ion-menu>
</template>

<script lang="ts" setup>
import {
  IonMenu,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  IonButton,
  menuController
} from '@ionic/vue';
import { useUserStore } from '../stores/useUserStore';

const userStore = useUserStore();

function closeMenu()
{
  console.log("wolol")
  menuController.toggle('profileMenu')
}
</script>
