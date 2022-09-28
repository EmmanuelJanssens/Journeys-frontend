import { defineStore } from "pinia";
import {ref} from 'vue'

export const useJourneyStore = defineStore('journey', ()=>{
  const  journeyRef = ref<Array<Poi>>()

  function addToJourney(poi: Poi){

    if(!alreadyExists(poi))
      journeyRef.value?.push(poi)
  }

  function removeFromJourney(poi: Poi){
    journeyRef.value =journeyRef.value?.filter(item => item.id != poi.id)
  }

  function alreadyExists(poi: Poi)
  {
    return journeyRef.value?.find(item => item.id == poi.id) != undefined
  }

  function saveJourney(name:String)
  {

  }
  return {journeyRef, addToJourney,removeFromJourney,saveJourney,alreadyExists}
})
