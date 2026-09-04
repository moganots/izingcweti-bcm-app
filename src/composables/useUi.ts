import { ref, computed } from 'vue'

export function useUi() {
    const darkMode = ref(localStorage.getItem('darkMode') === 'true')

    const isDarkMode = computed({
        get: () => darkMode.value,
        set: (val: boolean) => {
            darkMode.value = val
            localStorage.setItem('darkMode', String(val))
            if (val) {
                document.body.classList.add('dark')
            } else {
                document.body.classList.remove('dark')
            }
        },
    })

    function toggleDarkMode(): void {
        isDarkMode.value = !isDarkMode.value
    }

    return {
        isDarkMode,
        toggleDarkMode,
    }
}