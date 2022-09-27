import { defineStore } from "pinia";
import { ref } from "vue";
import axios, { AxiosError } from 'axios';
import url from "url";

export const usePoiStore = defineStore('poi', () => {
  const poiRef = ref<GeoJsonData>()

  function searchBetween(lat: number, lng: number,radius: number)
  {
    return axios.get(`api/pois?lat=${lat}&lng=${lng}&radius=${radius}`)
    .then(
      response =>
      {
        if(poiRef.value?.features?.length! > 0)
        {
          poiRef.value!.features = [];
        }

        poiRef.value =
        {
          type: 'FeatrureCollection',
          crs: {
            type: "name",
            properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" }
          },
          features:[]
        };


        (response.data.data as Array<Poi>).forEach((poi) => {
          poiRef.value!.features.push(
            {
              type:"Feature",
              geometry:{
                type:"Point",
                coordinates:[poi.location.longitude,poi.location.latitude]
              },
              properties:poi
            }
          )
        })
        return true;
      }
    )
    .catch((error: AxiosError) => {
      console.log((error.response?.data as ApiError).message)
      return false;
    })
  }

  return {poiRef, searchBetween}
})
