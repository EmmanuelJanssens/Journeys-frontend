<template>
    <DynamicScroller
        v-if="journeyStore.viewJourney?.experiencesAggregate?.count! > 0"
        :items="journeyStore.viewJourney.experiencesConnection?.edges"
        :min-item-size="54"
        style="height: 100%"
        key-field="order">
        <template v-slot="{ item, index, active }">
            <DynamicScrollerItem :item="item" :active="active" :data-index="index">
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
import ExperienceCard from "components/Cards/ExperienceCard.vue";

const journeyStore = useJourneyStore();

const emit = defineEmits<{
    (e: "updated", journeyId: string): void;
}>();
</script>
<style></style>
