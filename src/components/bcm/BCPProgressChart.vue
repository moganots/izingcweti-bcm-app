<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6 q-mb-md">BCP Progress</div>
            <div class="chart-container" style="height: 300px">
                <canvas ref="chartCanvas"></canvas>
            </div>
            <div class="text-caption text-grey-7 text-center q-mt-sm">
                Status distribution of Business Continuity Plans
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
        data?: {
            Draft: number
            Approved: number
            Active: number
            Archived: number
        }
    }>(),
    {
        data: () => ({ Draft: 0, Approved: 0, Active: 0, Archived: 0 }),
    }
)

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const colors = {
    Draft: '#9E9E9E',
    Approved: '#42A5F5',
    Active: '#66BB6A',
    Archived: '#FFA726',
}

function createChart(): void {
    if (!chartCanvas.value) return

    if (chartInstance) {
        chartInstance.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) return

    const data = props.data || { Draft: 0, Approved: 0, Active: 0, Archived: 0 }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Draft', 'Approved', 'Active', 'Archived'],
            datasets: [
                {
                    data: [data.Draft, data.Approved, data.Active, data.Archived],
                    backgroundColor: [
                        colors.Draft,
                        colors.Approved,
                        colors.Active,
                        colors.Archived,
                    ],
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
                        padding: 20,
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
    height: 300px;
}
</style>