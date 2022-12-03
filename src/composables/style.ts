import { MaybeRef } from "@vueuse/core";
import { onMounted, onUnmounted, Ref, ref } from "vue";

export function useVisibility(target: Ref<HTMLElement>, callback?: Function) {
    const visible = ref(true);
    const config = { attributes: true };
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type == "attributes") {
                checkVisible();
                if (callback) callback();
            }
        }
    });

    function checkVisible() {
        if (target && target.value && target.value.classList.contains("hidden")) visible.value = true;
    }

    onMounted(() => {
        observer.observe(target.value, {
            attributes: true
        });
    });

    onUnmounted(() => {
        observer.disconnect();
    });
    return visible;
}
