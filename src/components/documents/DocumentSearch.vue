<template>
    <div class="document-search">
        <q-input v-model="searchQuery" outlined dense :placeholder="placeholder" clearable :debounce="debounce"
            @update:model-value="handleSearch">
            <template v-slot:prepend>
                <q-icon name="search" />
            </template>
            <template v-slot:append>
                <q-icon name="filter_list" class="cursor-pointer" :color="hasFilters ? 'primary' : 'grey'"
                    @click="$emit('toggle-filters')">
                    <q-tooltip>Toggle Filters</q-tooltip>
                </q-icon>
                <q-icon v-if="searchQuery || hasFilters" name="clear" class="cursor-pointer" @click="clearSearch">
                    <q-tooltip>Clear Search</q-tooltip>
                </q-icon>
            </template>
        </q-input>

        <!-- Search History -->
        <q-slide-transition>
            <div v-if="showHistory && searchHistory.length > 0" class="q-mt-sm">
                <div class="text-caption text-grey-6 q-mb-xs">Recent Searches</div>
                <div class="row q-gutter-xs">
                    <q-badge v-for="term in searchHistory" :key="term" outline color="primary" :label="term"
                        class="cursor-pointer q-px-sm q-py-xs" @click="setSearch(term)">
                        <q-icon name="history" size="12px" class="q-mr-xs" />
                        {{ term }}
                    </q-badge>
                </div>
            </div>
        </q-slide-transition>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = withDefaults(
    defineProps<{
        modelValue?: string
        placeholder?: string
        debounce?: number
        showHistory?: boolean
    }>(),
    {
        modelValue: '',
        placeholder: 'Search documents...',
        debounce: 300,
        showHistory: false,
    }
)

const emit = defineEmits<{
    'update:modelValue': [value: string]
    search: [query: string]
    clear: []
    'toggle-filters': []
}>()

const searchQuery = ref(props.modelValue)
const searchHistory = ref<string[]>([])

const hasFilters = computed(() => false) // Will be controlled by parent

watch(
    () => props.modelValue,
    (val) => {
        searchQuery.value = val
    }
)

function handleSearch(): void {
    const query = searchQuery.value || ''
    emit('update:modelValue', query)
    emit('search', query)

    if (query && props.showHistory) {
        const history = new Set([query, ...searchHistory.value])
        searchHistory.value = Array.from(history).slice(0, 10)
    }
}

function setSearch(term: string): void {
    searchQuery.value = term
    handleSearch()
}

function clearSearch(): void {
    searchQuery.value = ''
    emit('update:modelValue', '')
    emit('clear')
}
</script>