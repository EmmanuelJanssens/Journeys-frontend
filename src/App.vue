<template>
  <ion-app>

    <ion-router-outlet content-id="main-content"/>
    <!--<user-detail-menu/>-->

  </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet} from '@ionic/vue'
import {useUserStore} from './stores/useUserStore'
import {onBeforeMount} from 'vue'
import UserDetailMenu from './components/UserDetailMenu.vue';

const userStore = useUserStore()
function readFromStorage()
{
    if(localStorage.getItem('user'))
    {
      const userRef = JSON.parse(localStorage.getItem('user')!).user;
      const token = JSON.parse(localStorage.getItem('user')!).token;
      userStore.$patch({
        token: token,
        userRef:{
          userName:userRef.userName,
          email:userRef.email,
          firstName:userRef.firstName,
          lastName:userRef.lastName
        },
        loggedIn:true
      })
      console.log(userStore.userRef)
    }
}

onBeforeMount(()=>
{
  readFromStorage();
})

</script>
