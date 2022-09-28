/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.png'
declare module 'haversine'
declare module '@maptiler/geocoder'
declare module 'vue-virtual-scroller'
