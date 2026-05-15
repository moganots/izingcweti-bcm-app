import { ref, computed } from 'vue';

/**
 * Composable for pagination logic
 */
export function usePagination(
    fetchFunction: (page: number, limit: number) => Promise<void>,
    options?: {
        initialPage?: number;
        initialLimit?: number;
        limitOptions?: number[];
    },
) {
    const currentPage = ref(options?.initialPage || 1);
    const itemsPerPage = ref(options?.initialLimit || 10);
    const totalItems = ref(0);
    const totalPages = ref(1);
    const isLoading = ref(false);
    const hasMore = ref(false);

    const limitOptions = ref(options?.limitOptions || [10, 20, 50, 100]);

    // ============================================
    // Computed
    // ============================================
    const hasNextPage = computed(() => currentPage.value < totalPages.value);
    const hasPreviousPage = computed(() => currentPage.value > 1);
    const isFirstPage = computed(() => currentPage.value === 1);
    const isLastPage = computed(() => currentPage.value === totalPages.value);

    const showingFrom = computed(() => {
        if (totalItems.value === 0) return 0;
        return (currentPage.value - 1) * itemsPerPage.value + 1;
    });

    const showingTo = computed(() => {
        const to = currentPage.value * itemsPerPage.value;
        return Math.min(to, totalItems.value);
    });

    // ============================================
    // Actions
    // ============================================

    /**
     * Go to a specific page
     */
    async function goToPage(page: number): Promise<void> {
        if (page < 1 || page > totalPages.value) return;
        currentPage.value = page;
        await loadData();
    }

    /**
     * Go to next page
     */
    async function nextPage(): Promise<void> {
        if (hasNextPage.value) {
            await goToPage(currentPage.value + 1);
        }
    }

    /**
     * Go to previous page
     */
    async function previousPage(): Promise<void> {
        if (hasPreviousPage.value) {
            await goToPage(currentPage.value - 1);
        }
    }

    /**
     * Go to first page
     */
    async function firstPage(): Promise<void> {
        await goToPage(1);
    }

    /**
     * Go to last page
     */
    async function lastPage(): Promise<void> {
        await goToPage(totalPages.value);
    }

    /**
     * Change items per page
     */
    async function setItemsPerPage(limit: number): Promise<void> {
        itemsPerPage.value = limit;
        currentPage.value = 1;
        await loadData();
    }

    /**
     * Load current page data
     */
    async function loadData(): Promise<void> {
        isLoading.value = true;
        try {
            await fetchFunction(currentPage.value, itemsPerPage.value);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Reset pagination to initial state
     */
    function reset(): void {
        currentPage.value = 1;
        totalItems.value = 0;
        totalPages.value = 1;
        hasMore.value = false;
    }

    /**
     * Update pagination metadata from API response
     */
    function updateMeta(meta: { total?: number; totalPages?: number; hasMore?: boolean }): void {
        if (meta.total !== undefined) totalItems.value = meta.total;
        if (meta.totalPages !== undefined) totalPages.value = meta.totalPages;
        if (meta.hasMore !== undefined) hasMore.value = meta.hasMore;
    }

    return {
        // State
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        isLoading,
        hasMore,
        limitOptions,
        // Computed
        hasNextPage,
        hasPreviousPage,
        isFirstPage,
        isLastPage,
        showingFrom,
        showingTo,
        // Actions
        goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,
        setItemsPerPage,
        loadData,
        reset,
        updateMeta,
    };
}