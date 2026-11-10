/**
 * AirSense City - Analytics & Telemetry Charts
 * Chart.js Integration
 * Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom
 */

class AirSenseCharts {
  constructor() {
    this.trendChart = null;
    this.comparisonChart = null;
    this.currentParam = 'ispu'; // 'ispu', 'pm25', 'pm10'
  }

  renderTrendChart(containerId, store) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return;

    const selectedSt = store.getSelectedStation();
    const history = store.history[selectedSt.id] || [];

    const labels = history.map(h => h.label);
    const dataValues = history.map(h => {
      if (this.currentParam === 'pm25') return h.pm25;
      if (this.currentParam === 'pm10') return h.pm10;
      return h.ispu;
    });

    const status = getISPUStatus(selectedSt.ispu);
    const borderColor = this.currentParam === 'ispu' ? status.strokeColor : '#0f4c5c';
    const bgColor = this.currentParam === 'ispu' ? `${status.strokeColor}18` : '#0f4c5c18';

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    const datasets = [
      {
        label: `${selectedSt.name} - ${this.currentParam.toUpperCase()}`,
        data: dataValues,
        borderColor: borderColor,
        backgroundColor: bgColor,
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: borderColor
      }
    ];

    // Ambang baku mutu garis putus-putus
    if (this.currentParam === 'pm25') {
      datasets.push({
        label: 'Batas Baku Mutu Aman (55 µg/m³)',
        data: labels.map(() => 55.0),
        borderColor: '#ba1a1a',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false
      });
    } else if (this.currentParam === 'pm10') {
      datasets.push({
        label: 'Batas Baku Mutu Aman (75 µg/m³)',
        data: labels.map(() => 75.0),
        borderColor: '#ba1a1a',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false
      });
    }

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Inter', size: 12, weight: '600' },
              color: '#0b1c30'
            }
          },
          tooltip: {
            backgroundColor: '#003441',
            titleFont: { family: 'Inter', size: 12, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#70787c' }
          },
          y: {
            grid: { color: '#e5eeff' },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#70787c' },
            beginAtZero: true
          }
        }
      }
    });
  }

  renderComparisonChart(containerId, store) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return;

    const stations = store.stations;
    const labels = stations.map(s => s.name.replace(/Area |Kawasan |Pusat /g, ''));
    const ispuData = stations.map(s => s.ispu);
    const pm25Data = stations.map(s => s.pm25);

    if (this.comparisonChart) {
      this.comparisonChart.destroy();
    }

    this.comparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'ISPU Terhitung',
            data: ispuData,
            backgroundColor: stations.map(s => {
              const st = getISPUStatus(s.ispu);
              return st.strokeColor;
            }),
            borderRadius: 6
          },
          {
            label: 'Konsentrasi PM2.5 (µg/m³)',
            data: pm25Data,
            backgroundColor: '#d3e4fe',
            borderColor: '#4059aa',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Inter', size: 12, weight: '600' },
              color: '#0b1c30'
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11, weight: '600' }, color: '#0b1c30' }
          },
          y: {
            grid: { color: '#e5eeff' },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#70787c' },
            beginAtZero: true
          }
        }
      }
    });
  }

  setParam(param, store) {
    this.currentParam = param;
    this.renderTrendChart('analytics-trend-chart', store);
  }
}

window.airSenseCharts = new AirSenseCharts();

