<template>
    <AutoComplete
        :input="input!"
        :placeholder="placeholder"
        :debounce="500"
        :predictions="predictions!"
        @complete="onAutoComplete"
        @selected="onSelected"
        @focus-out="predictions = []" />
</template>
<script lang="ts" setup>
import googleLoader from "google/googleLoader";
import { onMounted, ref } from "vue";
import AutoComplete from "./JAutocomplete/AutoComplete.vue";

const input = ref<string>("");
const predictions = ref<
    {
        value: string;
        key: string | number | any;
    }[]
>([]);

defineProps<{
    text: string;
    placeholder: string;
}>();

const emits = defineEmits<{
    (e: "selected", value: string): void;
    (e: "dirty"): void;
}>();
let service: google.maps.places.AutocompleteService;

onMounted(() => {
    googleLoader.load().then((google) => {
        service = new google.maps.places.AutocompleteService();
    });
});

function onAutoComplete(value: string) {
    input.value = value;
    emits("dirty");
    if (value.length > 3) {
        const request: google.maps.places.AutocompletionRequest = {
            input: value,
            types: ["locality"],
            componentRestrictions: { country: "ch" }
        };
        service.getPlacePredictions(request).then((response) => {
            response.predictions.forEach((prediction) => {
                predictions.value.push({
                    value: prediction.description,
                    key: prediction.place_id
                });
            });
        });
    } else {
        predictions.value = [];
    }
}

function onSelected(value: string) {
    input.value = value;
    predictions.value = [];
    emits("selected", input.value);
}
</script>