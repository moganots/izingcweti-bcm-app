<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6 q-mb-md">Maturity Assessment Trend</div>

            <div v-if="loading" class="text-center q-py-lg">
                <q-spinner-dots size="40px" color="primary" />
            </div>

            <div v-else-if="!data || data.length === 0" class="text-center q-py-lg text-grey-7">
                <q-icon name="trending_flat" size="48px" color="grey-4" class="q-mb-sm" />
                <div>No maturity data available</div>
            </div>

            <div v-else>
                <!-- Chart Container -->
                <canvas ref="chartContainer" class="chart-container"></canvas>

                <!-- Legend -->
                <div class="row justify-center q-gutter-md q-mt-md">
                    <div class="row items-center q-gutter-xs">
                        <div class="legend-dot" style="background: #4caf50;"></div>
                        <span class="text-caption">Score</span>
                    </div>
                    <div class="row items-center q-gutter-xs">
                        <div class="legend-dot" style="background: #2196f3;"></div>
                        <span class="text-caption">Level</span>
                    </div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { MaturityLevel } from 'src/models/entities/governance/governance.entity'
import { getMaturityLevelLabel } from 'src/models/entities/governance/governance.entity'

// ============================================
// Props
// ============================================
const props = defineProps<{
    data?: Array<{ date: string; score: number; level: string }>
    loading?: boolean
}>()

// ============================================
// Refs
// ============================================
const chartContainer = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

// ============================================
// Methods
// ============================================
async function initChart(): Promise<void> {
    await nextTick()

    if (!chartContainer.value || !props.data || props.data.length === 0) return

    // Dynamically import Chart.js
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)

    const ctx = chartContainer.value.getContext('2d')

    if (!ctx) return

    // Prepare data
    const dates = props.data.map(item => {
        const d = new Date(item.date)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const scores = props.data.map(item => item.score)

    // Destroy existing chart
    if (chartInstance) {
        chartInstance.destroy()
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Maturity Score',
                    data: scores,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4caf50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                },
                {
                    label: 'Maturity Level',
                    data: scores.map(() => 50), // Center line for level display
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    tension: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        afterBody: function (context: any) {
                            const index = context[0]?.dataIndex
                            if (index !== undefined && props.data) {
                                const item = props.data[index]
                                return `Level: ${getMaturityLevelLabel(item?.level as MaturityLevel)}`
                            }
                            return ''
                        },
                    },
                },
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: function (value: any) {
                            return value + '%'
                        },
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    },
                },
                x: {
                    grid: {
                        display: false,
                    },
                },
            },
            elements: {
                line: {
                    borderWidth: 2,
                },
                point: {
                    radius: 5,
                    hoverRadius: 7,
                },
            },
        },
    })

}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
    if (props.data && props.data.length > 0) {
        initChart()
    }
})

onUnmounted(() => {
    if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
    }
})

watch(
    () => props.data,
    async () => {
        if (props.data && props.data.length > 0) {
            await initChart()
        }
    },
    { deep: true }
)
</script>

<style lang="scss" scoped>
.chart-container {
    width: 100%;
    height: 300px;

    @media (max-width: 600px) {
        height: 220px;
    }
}

.legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
}
</style>