<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6 q-mb-md">Compliance Status Distribution</div>
            <div class="chart-container" style="height: 250px">
                <canvas ref="chartCanvas"></canvas>
            </div>
            <div class="text-caption text-grey-7 text-center q-mt-sm">
                Status breakdown of compliance records
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = withDefaults(
    defineProps<{
        data?: Array<{ status: string; count: number }>
    }>(),
    {
        data: () => [],
    }
)

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const statusColors: Record<string, string> = {
    COMPLIANT: '#66BB6A',
    PARTIALLY_COMPLIANT: '#FFA726',
    NON_COMPLIANT: '#EF5350',
    NOT_ASSESSED: '#BDBDBD',
}

const statusLabels: Record<string, string> = {
    COMPLIANT: 'Compliant',
    PARTIALLY_COMPLIANT: 'Partially Compliant',
    NON_COMPLIANT: 'Non-Compliant',
    NOT_ASSESSED: 'Not Assessed',
}

function createChart(): void {
    if (!chartCanvas.value) return

    if (chartInstance) {
        chartInstance.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) return

    const data = props.data || []
    const labels = data.map((d) => statusLabels[d.status] || d.status)
    const values = data.map((d) => d.count)
    const colors = data.map((d) => statusColors[d.status] || '#BDBDBD')

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                            const value = context.parsed
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                            return `${context.label}: ${value} (${percentage}%)`
                        },
                    },
                },
            },
        },
    })
}

onMounted(() => {
    createChart()
})

watch(() => props.data, () => {
    createChart()
}, { deep: true })
</script>

<style lang="scss" scoped>
.chart-container {
    position: relative;
    height: 250px;
}
</style>