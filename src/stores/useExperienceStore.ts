import { defineStore } from "pinia";
import { ref } from "vue";

export const useExperienceStore = defineStore("experience", () => {
    const state = ref({
        experienceIsLoading: false,
        experienceIsSaving: false,
        experienceIsDeleting: false,
        experienceIsUploading: false,
        experienceIsAdding: false,
        experienceIsRemoving: false,
        experienceIsUpdating: false
    });

    return {
        state
    };
});
