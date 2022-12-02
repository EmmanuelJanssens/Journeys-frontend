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
import AutoComplete from "components/jAutocomplete/AutoComplete.vue";

const input = ref<string>("");

const predictions = ref<
    {
        value: string;
        key: string | number | any;
    }[]
>([]);

const props = defineProps({
    text: String,
    placeholder: String,
    type: {
        type: Array<string>,
        default: ["locality"]
    },
    restriction: {
        type: String,
        default: "ch"
    }
});

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
        const newPredictions: {
            value: string;
            key: string | number | any;
        }[] = [];

        const request: google.maps.places.AutocompletionRequest = {
            input: value,
            types: props.type,
            componentRestrictions: { country: props.restriction }
        };
        service.getPlacePredictions(request).then((response) => {
            response.predictions.forEach((prediction) => {
                newPredictions.push({
                    value: prediction.description,
                    key: prediction.place_id
                });
            });
            predictions.value = newPredictions;
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
