<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">Incident Statistics</div>
                <q-btn flat round dense icon="refresh" size="sm" @click="$emit('refresh')">
                    <q-tooltip>Refresh Stats</q-tooltip>
                </q-btn>
            </div>

            <div class="row q-col-gutter-sm">
                <div class="col-6 col-md-2" v-for="stat in stats" :key="stat.label">
                    <q-card flat bordered :class="'bg-' + stat.color + '-1'">
                        <q-card-section class="text-center q-py-sm">
                            <q-icon :name="stat.icon" :color="stat.color" size="20px" class="q-mb-xs" />
                            <div class="text-h6" :class="'text-' + stat.color">{{ stat.value }}</div>
                            <div class="text-caption text-grey-7">{{ stat.label }}</div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

            <!-- Trend -->
            <div class="q-mt-md">
                <div class="text-body2 q-mb-sm">Incident Trend (Last 6 Months)</div>
                <div class="chart-container" style="height: 150px">
                    <canvas ref="chartCanvas"></canvas>
                </div>
            </div>

            <!-- Resolution Time -->
            <div class="q-mt-md">
                <div class="row q-col-gutter-sm">
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Average Resolution Time</div>
                        <div class="text-h5 text-primary">{{ averageResolutionTime || 'N/A' }}</div>
                    </div>
                    <div class="col-6">
                        <div class="text-caption text-grey-6">Incidents This Month</div>
                        <div class="text-h5" :class="trend >= 0 ? 'text-negative' : 'text-green'">
                            {{ incidentsThisMonth }}
                            <q-icon :name="trend >= 0 ? 'arrow_upward' : 'arrow_downward'" size="20px" />
                            <span class="text-caption">{{ Math.abs(trend) }}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- By Status -->
            <div class="q-mt-md">
                <div class="text-body2 q-mb-sm">By Status</div>
                <div class="row q-gutter-xs">
                    <div v-for="(count, status) in byStatus" :key="status" class="col">
                        <q-badge :color="getStatusColor(status)" :label="formatStatus(status)"
                            class="full-width text-center q-py-sm">
                            <div class="text-h6">{{ count }}</div>
                        </q-badge>
                    </div>
                </div>
            </div>

            <div class="text-caption text-grey-7 text-center q-mt-sm">
                Last updated: {{ lastUpdatedText }}
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { formatTimeAgo } from '../../utils/date.utils'
import {
    getIncidentStatusLabel,
    getIncidentStatusColor,
} from './../../models/entities/incident/incident.entity'

Chart.register(...registerables)

const props = withDefaults(
    defineProps<{
        stats?: {
            total: number
            active: number
            closed: number
            critical: number
            high: number
            medium: number
            low: number
            averageResolutionHours: number
            byMonth: Array<{ month: string; count: number }>
            byStatus: Record<string, number>
            bySeverity: Record<string, number>
            incidentsThisMonth: number
            trend: number
        }
        lastUpdated?: string | null
    }>(),
    {
        stats: () => ({
            total: 0,
            active: 0,
            closed: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            averageResolutionHours: 0,
            byMonth: [],
            byStatus: {},
            bySeverity: {},
            incidentsThisMonth: 0,
            trend: 0,
        }),
        lastUpdated: null,
    }
)

defineEmits<{ refresh: [] }>()

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const stats = computed(() => [
    { label: 'Total', value: props.stats.total, icon: 'report', color: 'primary' },
    { label: 'Active', value: props.stats.active, icon: 'warning', color: 'orange' },
    { label: 'Closed', value: props.stats.closed, icon: 'check_circle', color: 'green' },
    { label: 'Critical', value: props.stats.critical, icon: 'error', color: 'red' },
    { label: 'High', value: props.stats.high, icon: 'warning', color: 'orange' },
])

const byStatus = computed(() => props.stats.byStatus || {})
const averageResolutionTime = computed(() => {
    const hours = props.stats.averageResolutionHours || 0
    if (hours === 0) return 'N/A'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
})
const incidentsThisMonth = computed(() => props.stats.incidentsThisMonth || 0)
const trend = computed(() => props.stats.trend || 0)

const lastUpdatedText = computed(() => {
    if (!props.lastUpdated) return 'Never'
    return formatTimeAgo(props.lastUpdated)
})

function formatStatus(status: string): string {
    return getIncidentStatusLabel(status)
}

function getStatusColor(status: string): string {
    return getIncidentStatusColor(status)
}

function createChart(): void {
    if (!chartCanvas.value || !props.stats.byMonth || props.stats.byMonth.length === 0) return

    if (chartInstance) {
        chartInstance.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) return

    const data = props.stats.byMonth
    const labels = data.map((d) => d.month)
    const values = data.map((d) => d.count)

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Incidents',
                    data: values,
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#f44336',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                    },
                },
            },
        },
    })
}

onMounted(() => {
    createChart()
})

watch(() => props.stats.byMonth, () => {
    createChart()
}, { deep: true })
</script>

<style lang="scss" scoped>
.chart-container {
    position: relative;
}
</style>