<template>
    <AutoComplete
        :icon="faCity"
        :placeholder="placeholder"
        :debounce="500"
        :predictions="predictions!"
        v-model="input"
        @complete="onAutoComplete"
        @input="emits('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @selected="onSelected"
        @focus-out="predictions = []" />
</template>
<script lang="ts" setup>
import googleLoader from "google/googleLoader";
import { onMounted, ref } from "vue";
import AutoComplete from "components/jAutocomplete/AutoComplete.vue";
import { faCity } from "@fortawesome/free-solid-svg-icons";
const input = ref<string>("");

const predictions = ref<
    {
        value: string;
        key: string | number | any;
    }[]
>([]);

const props = defineProps({
    modelValue: String,
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
    (e: "update:modelValue", value: string): void;
}>();
let service: google.maps.places.AutocompleteService;

onMounted(() => {
    googleLoader.load().then((google) => {
        service = new google.maps.places.AutocompleteService();
    });
});

function onAutoComplete(value: string) {
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
    predictions.value = [];
    input.value = value;
    emits("selected", value);
}
</script>
