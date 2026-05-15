import { ref, onUnmounted } from 'vue';

/**
 * Composable for infinite scroll loading
 */
export function useInfiniteScroll(
    loadMore: () => Promise<void>,
    options?: {
        threshold?: number;
        enabled?: boolean;
    },
) {
    const isLoadingMore = ref(false);
    const hasMore = ref(true);
    const isEnabled = ref(options?.enabled ?? true);
    const threshold = options?.threshold || 100;
    let scrollContainer: HTMLElement | null = null;

    /**
     * Handle scroll event
     */
    async function handleScroll(): Promise<void> {
        if (!isEnabled.value || !hasMore.value || isLoadingMore.value) return;
        if (!scrollContainer) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            isLoadingMore.value = true;
            try {
                await loadMore();
            } finally {
                isLoadingMore.value = false;
            }
        }
    }

    /**
     * Attach scroll listener to container
     */
    function attach(container: HTMLElement): void {
        scrollContainer = container;
        container.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Detach scroll listener
     */
    function detach(): void {
        if (scrollContainer) {
            scrollContainer.removeEventListener('scroll', handleScroll);
            scrollContainer = null;
        }
    }

    /**
     * Enable infinite scroll
     */
    function enable(): void {
        isEnabled.value = true;
    }

    /**
     * Disable infinite scroll
     */
    function disable(): void {
        isEnabled.value = false;
    }

    /**
     * Reset infinite scroll state
     */
    function reset(): void {
        hasMore.value = true;
        isLoadingMore.value = false;
    }

    onUnmounted(() => {
        detach();
    });

    return {
        isLoadingMore,
        hasMore,
        isEnabled,
        attach,
        detach,
        enable,
        disable,
        reset,
    };
}