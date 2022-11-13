<template>
    <DynamicScroller
        v-if="journeyStore.viewJourney?.experiences?.length! > 0"
        :items="journeyStore.viewJourney.experiences"
        :min-item-size="54"
        style="height: 100%">
        <template v-slot="{ item, index, active }">
            <DynamicScrollerItem :item="item as ExperienceDto" :active="active" :data-index="index">
                <ExperienceCard
                    :experience="item"
                    :journey="journeyStore.viewJourney.id!"
                    @updated="emit('updated', journeyStore.viewJourney.id!)" />
            </DynamicScrollerItem>
        </template>
    </DynamicScroller>
</template>
<script lang="ts" setup>
import { useJourneyStore } from "stores/useJourneyStore";
import { ExperienceDto } from "types/dtos";
import ExperienceCard from "components/Cards/ExperienceCard.vue";

const journeyStore = useJourneyStore();

const emit = defineEmits<{
    (e: "updated", journeyId: string): void;
}>();
</script>
<style></style>
