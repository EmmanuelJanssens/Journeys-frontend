import { createRouter, createWebHistory} from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
const HomePage = () => import('../views/HomePage.vue')
const MapExplorePage = () => import('../views/MapExplorePage.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/map',
    name:'map',
    component:MapExplorePage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
