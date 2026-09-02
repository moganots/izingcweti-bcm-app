<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6 q-mb-md">Compliance by Standard</div>
            <div class="chart-container" style="height: 250px">
                <canvas ref="chartCanvas"></canvas>
            </div>
            <div class="text-caption text-grey-7 text-center q-mt-sm">
                Compliance rate by standard
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
        data?: Array<{ standard: string; compliant: number; total: number }>
    }>(),
    {
        data: () => [],
    }
)

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const standardColors: Record<string, string> = {
    ISO22301: '#42A5F5',
    NIST800_34: '#66BB6A',
    FFIEC: '#FFA726',
    COBIT2019: '#AB47BC',
    SOC2: '#26A69A',
    GDPR: '#5C6BC0',
    HIPAA: '#EF5350',
    PCI_DSS: '#FFEE58',
}

const standardLabels: Record<string, string> = {
    ISO22301: 'ISO 22301',
    NIST800_34: 'NIST 800-34',
    FFIEC: 'FFIEC',
    COBIT2019: 'COBIT 2019',
    SOC2: 'SOC 2',
    GDPR: 'GDPR',
    HIPAA: 'HIPAA',
    PCI_DSS: 'PCI DSS',
}

function createChart(): void {
    if (!chartCanvas.value) return

    if (chartInstance) {
        chartInstance.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) return

    const data = props.data || []
    const labels = data.map((d) => standardLabels[d.standard] || d.standard)
    const rates = data.map((d) => d.total > 0 ? (d.compliant / d.total) * 100 : 0)
    const colors = data.map((d) => standardColors[d.standard] || '#BDBDBD')
    const counts = data.map((d) => `${d.compliant}/${d.total}`)

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Compliance Rate (%)',
                    data: rates,
                    backgroundColor: colors,
                    borderColor: colors.map((c) => c),
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function (value: any) {
                            return value + '%'
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            const index = context.dataIndex
                            return `Rate: ${context.parsed.y.toFixed(1)}% (${counts[index] || '0/0'})`
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