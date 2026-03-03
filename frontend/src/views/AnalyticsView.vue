<template>
  <div class="analytics-page">
    <div class="page-container">

    
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t('analytics.title') }}</h1>
          <p class="page-subtitle">{{ t('dept.name') }}</p>
        </div>
        <button class="export-btn" @click="exportCSV">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ t('analytics.export') }} (CSV)
        </button>
      </div>

     
      <div class="filter-card">
        <div class="filter-group">
          <label>{{ t('analytics.period') }}</label>
          <select v-model="selectedPeriod" class="filter-select">
            <option value="today">{{ t('analytics.today') }}</option>
            <option value="week">{{ t('analytics.week') }}</option>
            <option value="month">{{ t('analytics.month') }}</option>
            <option value="custom">{{ t('analytics.custom') }}</option>
          </select>
        </div>
        <template v-if="selectedPeriod === 'custom'">
          <div class="filter-group">
            <label>{{ t('analytics.from') }}</label>
            <input v-model="customDates.start" type="date" class="filter-select" />
          </div>
          <div class="filter-group">
            <label>{{ t('analytics.to') }}</label>
            <input v-model="customDates.end" type="date" class="filter-select" />
          </div>
        </template>
        <button class="apply-btn" @click="loadData">{{ t('analytics.apply') }}</button>
      </div>

      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon blue">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div>
            <div class="metric-label">{{ t('analytics.totalTickets') }}</div>
            <div class="metric-value">{{ stats.overview?.total || 0 }}</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon green">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div class="metric-label">{{ t('analytics.served') }}</div>
            <div class="metric-value">{{ stats.overview?.completed || 0 }}</div>
            <div class="metric-sub green">{{ stats.overview?.completionRate || 0 }}%</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon orange">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div class="metric-label">{{ t('analytics.avgWait') }}</div>
            <div class="metric-value">{{ stats.timing?.avgWaitTimeFormatted || '—' }}</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon red">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div class="metric-label">{{ t('analytics.avgService') }}</div>
            <div class="metric-value">{{ stats.timing?.avgServiceTimeFormatted || '—' }}</div>
          </div>
        </div>
      </div>

      
      <div class="two-col">

        <div class="card">
          <h3 class="card-title">{{ t('analytics.staffStats') }}</h3>
          <div v-if="stats.staffStats && stats.staffStats.length > 0">
            <table class="inner-table">
              <thead>
                <tr>
                  <th>{{ t('analytics.staffName') }}</th>
                  <th>{{ t('analytics.ticketsServed') }}</th>
                  <th>{{ t('analytics.avgServiceShort') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in stats.staffStats" :key="s.id">
                  <td>
                    <div class="name-cell">
                      <div class="avatar-sm">{{ s.fullName?.charAt(0) }}</div>
                      {{ s.fullName }}
                    </div>
                  </td>
                  <td><strong>{{ s.served }}</strong></td>
                  <td>{{ s.avgServiceTime }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="no-data">{{ t('analytics.noData') }}</p>
        </div>

        <div class="card">
          <h3 class="card-title">{{ t('analytics.topServices') }}</h3>
          <div v-if="stats.topServices && stats.topServices.length > 0" class="service-bars">
            <div v-for="svc in stats.topServices" :key="svc.purpose" class="svc-row">
              <div class="svc-label">{{ translatePurpose(svc.purpose) }}</div>
              <div class="svc-track">
                <div class="svc-fill" :style="{ width: getServicePct(svc.count) + '%' }"></div>
              </div>
              <div class="svc-count">{{ svc.count }}</div>
            </div>
          </div>
          <p v-else class="no-data">{{ t('analytics.noData') }}</p>
        </div>

      </div>

     
      <div v-if="stats.peakHour" class="card peak-card">
        <h3 class="card-title">{{ t('analytics.peakHour') }}</h3>
        <div class="peak-content">
          <span class="peak-time">{{ stats.peakHour.hour }}:00</span>
          <span class="peak-count">{{ stats.peakHour.count }} {{ t('analytics.tickets') }}</span>
        </div>
      </div>

      
      <div v-if="stats.hourlyDistribution && stats.hourlyDistribution.length" class="card">
        <h3 class="card-title">{{ t('analytics.hourlyChart') }}</h3>
        <div class="chart">
          <div v-for="item in stats.hourlyDistribution" :key="item.hour" class="bar-col">
            <div class="bar" :style="{ height: getBarHeight(item.count) + '%' }">
              <span class="bar-val">{{ item.count }}</span>
            </div>
            <div class="bar-lbl">{{ item.hour }}:00</div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { analyticsAPI } from '@/services/api'

const { t, te } = useI18n()
const loading = ref(false)
const selectedPeriod = ref('today')
const customDates = reactive({ start: '', end: '' })

const stats = reactive({
  overview: null, timing: null,
  hourlyDistribution: [], peakHour: null,
  topServices: [], staffStats: [], tickets: []
})

async function loadData() {
  loading.value = true
  try {
    let res
    if (selectedPeriod.value === 'today') {
      res = await analyticsAPI.getToday()
    } else {
      const end = new Date()
      const start = new Date()
      if (selectedPeriod.value === 'week') start.setDate(start.getDate() - 7)
      else if (selectedPeriod.value === 'month') start.setMonth(start.getMonth() - 1)
      const s = selectedPeriod.value === 'custom' ? customDates.start : start.toISOString().split('T')[0]
      const e = selectedPeriod.value === 'custom' ? customDates.end : end.toISOString().split('T')[0]
      if (!s || !e) { loading.value = false; return }
      res = await analyticsAPI.getPeriod(s, e)
    }
    const d = res.data.data
    stats.overview = d.overview
    stats.timing = d.timing
    stats.hourlyDistribution = d.hourlyDistribution || []
    stats.peakHour = d.peakHour
    stats.topServices = d.topServices || []
    stats.staffStats = d.staffStats || []
    stats.tickets = d.tickets || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const maxCount = computed(() => stats.hourlyDistribution.length ? Math.max(...stats.hourlyDistribution.map(i => i.count)) : 1)
const getBarHeight = (c) => Math.round((c / maxCount.value) * 100)

const maxSvc = computed(() => stats.topServices.length ? Math.max(...stats.topServices.map(s => s.count)) : 1)
const getServicePct = (c) => Math.round((c / maxSvc.value) * 100)

function translatePurpose(p) {
  if (p && te(p)) return t(p)
  return p || '—'
}

function exportCSV() {
  if (!stats.tickets.length) { alert('Нет данных'); return }
  const h = ['№', 'Услуга', 'Студент', 'Создан', 'Вызван', 'Завершён', 'Ожидание(мин)', 'Обслуживание(мин)', 'Статус', 'Сотрудник']
  const rows = stats.tickets.map(t => [
    t.ticketNumber, translatePurpose(t.purpose), t.studentName,
    t.createdAt ? new Date(t.createdAt).toLocaleString('ru-RU') : '',
    t.calledAt ? new Date(t.calledAt).toLocaleString('ru-RU') : '',
    t.completedAt ? new Date(t.completedAt).toLocaleString('ru-RU') : '',
    t.calledAt && t.createdAt ? Math.round((new Date(t.calledAt) - new Date(t.createdAt)) / 60000) : '',
    t.completedAt && t.calledAt ? Math.round((new Date(t.completedAt) - new Date(t.calledAt)) / 60000) : '',
    t.status, t.servedByName || ''
  ])
  const csv = '\uFEFF' + [h, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `Отчет-${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.csv`
  a.click()
}

onMounted(() => loadData())
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background: var(--color-primary);
  color: white;
  padding: 40px;
  font-family: 'Segoe UI', sans-serif;
}
.page-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

.page-header {
  background: rgba(28,31,44,0.95);
  border-radius: var(--border-radius-lg);
  padding: 30px 40px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}
.page-title { font-size: 32px; font-weight: 700; margin: 0 0 6px; }
.page-subtitle { font-size: 16px; color: rgba(255,255,255,0.5); margin: 0; }
.export-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 24px; background: rgba(255,255,255,0.1);
  color: white; border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.export-btn:hover { background: var(--color-accent); border-color: var(--color-accent); }

.filter-card {
  background: rgba(28,31,44,0.95);
  border-radius: var(--border-radius-lg);
  padding: 24px 32px;
  display: flex; gap: 20px; align-items: flex-end;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}
.filter-group { display: flex; flex-direction: column; gap: 8px; min-width: 160px; }
.filter-group label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
.filter-select {
  padding: 10px 14px; background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
  color: white; font-size: 14px; outline: none; cursor: pointer;
}
.filter-select option { background: #1e2536; }
.apply-btn {
  padding: 10px 24px; background: var(--color-accent); color: white;
  border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap;
}
.apply-btn:hover { background: #b91c1c; }

.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.metric-card {
  background: rgba(28,31,44,0.95);
  border-radius: var(--border-radius-lg);
  padding: 24px; display: flex; align-items: center; gap: 16px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}
.metric-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.metric-icon.blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
.metric-icon.green { background: rgba(34,197,94,0.15); color: #4ade80; }
.metric-icon.orange { background: rgba(249,115,22,0.15); color: #fb923c; }
.metric-icon.red { background: rgba(220,38,38,0.15); color: #f87171; }
.metric-label { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 4px; }
.metric-value { font-size: 28px; font-weight: 700; color: white; }
.metric-sub { font-size: 13px; font-weight: 600; margin-top: 2px; }
.metric-sub.green { color: #4ade80; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card {
  background: rgba(28,31,44,0.95);
  border-radius: var(--border-radius-lg);
  padding: 28px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}
.card-title { font-size: 17px; font-weight: 600; color: white; margin: 0 0 20px; }
.no-data { color: rgba(255,255,255,0.3); font-size: 14px; text-align: center; padding: 20px 0; margin: 0; }

.inner-table { width: 100%; border-collapse: collapse; }
.inner-table th { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.07); text-align: left; }
.inner-table td { padding: 12px; font-size: 14px; color: rgba(255,255,255,0.8); border-bottom: 1px solid rgba(255,255,255,0.05); }
.inner-table tr:last-child td { border-bottom: none; }
.name-cell { display: flex; align-items: center; gap: 10px; }
.avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }

.service-bars { display: flex; flex-direction: column; gap: 14px; }
.svc-row { display: flex; align-items: center; gap: 12px; }
.svc-label { font-size: 13px; color: rgba(255,255,255,0.7); width: 170px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.svc-track { flex: 1; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
.svc-fill { height: 100%; background: var(--color-accent); border-radius: 4px; transition: width 0.5s ease; }
.svc-count { font-size: 14px; font-weight: 700; color: white; min-width: 24px; text-align: right; }

.peak-card {}
.peak-content { display: flex; align-items: center; gap: 20px; }
.peak-time { font-size: 52px; font-weight: 700; color: var(--color-accent); }
.peak-count { font-size: 22px; color: rgba(255,255,255,0.6); }

.chart { display: flex; align-items: flex-end; gap: 8px; height: 220px; padding-top: 20px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
.bar {
  width: 100%; background: linear-gradient(180deg, var(--color-accent), #991b1b);
  border-radius: 6px 6px 0 0;
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 6px; margin-top: auto; min-height: 4px; transition: all 0.3s;
}
.bar:hover { filter: brightness(1.2); }
.bar-val { color: white; font-size: 11px; font-weight: 600; }
.bar-lbl { margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.35); }

.loading-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 999;
}
.spinner { width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
</style>