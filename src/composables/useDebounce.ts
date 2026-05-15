import { ref, watch, onUnmounted, Ref } from 'vue';

/**
 * Composable for debouncing values
 */
export function useDebounce<T>(initialValue: T, delay: number = 300) {
    const debouncedValue = ref<T>(initialValue) as Ref<T>;
    const inputValue = ref<T>(initialValue) as Ref<T>;
    let timer: ReturnType<typeof setTimeout> | null = null;

    watch(inputValue, (newValue) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            debouncedValue.value = newValue;
        }, delay);
    });

    onUnmounted(() => {
        if (timer) clearTimeout(timer);
    });

    return {
        inputValue,
        debouncedValue,
    };
}