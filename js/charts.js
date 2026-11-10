/**
 * ============================================================================
 * e-Homestay PERDA (Inap Desa) - Analytics, Charts & Reports Script (charts.js)
 * Renders high-DPI HTML5 Canvas charts strictly using the PERDA Color Palette:
 *   - Olive Green:  #606C38
 *   - Dark Green:   #283618
 *   - Cream:        #FEFAE0
 *   - Sand:         #DDA15E
 *   - Burnt Orange: #BC6C25
 * Also handles Page 6 Report Filtering, Export PDF, and Export Excel (.csv).
 * ============================================================================
 */

const REPORT_RECORDS = [
  {
    month: 'Jun 2026',
    dateISO: '2026-06-15',
    homestayId: 'hs-101',
    homestayName: 'Inap Desa Kampung Agung Harmoni',
    district: 'Kepala Batas',
    bookingsCount: 18,
    touristVolume: 84,
    collectionRM: 7920,
    occupancyRate: '76%'
  },
  {
    month: 'Jul 2026',
    dateISO: '2026-07-15',
    homestayId: 'hs-102',
    homestayName: 'Teratak Dusun Mengkuang Titi',
    district: 'Kubang Semang',
    bookingsCount: 15,
    touristVolume: 68,
    collectionRM: 5550,
    occupancyRate: '71%'
  },
  {
    month: 'Aug 2026',
    dateISO: '2026-08-15',
    homestayId: 'hs-103',
    homestayName: 'Anjung Bendang Pulau Betong',
    district: 'Balik Pulau',
    bookingsCount: 21,
    touristVolume: 112,
    collectionRM: 10920,
    occupancyRate: '84%'
  },
  {
    month: 'Sep 2026',
    dateISO: '2026-09-15',
    homestayId: 'hs-104',
    homestayName: 'Villa Muara Sungai Acheh',
    district: 'Nibong Tebal',
    bookingsCount: 12,
    touristVolume: 54,
    collectionRM: 4680,
    occupancyRate: '64%'
  },
  {
    month: 'Oct 2026',
    dateISO: '2026-10-15',
    homestayId: 'hs-105',
    homestayName: 'Desa Damai Chalet Pulau Aman',
    district: 'Pulau Aman',
    bookingsCount: 19,
    touristVolume: 76,
    collectionRM: 9120,
    occupancyRate: '81%'
  },
  {
    month: 'Nov 2026',
    dateISO: '2026-11-06',
    homestayId: 'hs-106',
    homestayName: 'Laman Agro Lahar Yooi',
    district: 'Tasek Gelugor',
    bookingsCount: 16,
    touristVolume: 72,
    collectionRM: 5440,
    occupancyRate: '74%'
  }
];

/**
 * 1. PAGE 4: OFFICER DASHBOARD BOOKING TREND CHART (Line + Area + Bar Hybrid)
 */
function drawOfficerDashboardTrendChart() {
  const canvas = document.getElementById('officerTrendChartCanvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const parentWidth = canvas.parentElement.clientWidth || 680;
  const height = 290;

  canvas.width = parentWidth * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${parentWidth}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const bookingsData = [42, 58, 64, 79, 71, 88, 96];
  const revenueK = [14.2, 19.8, 22.4, 28.5, 25.1, 31.8, 35.4];

  const pad = { top: 32, right: 32, bottom: 44, left: 48 };
  const plotW = parentWidth - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxVal = 110;

  ctx.clearRect(0, 0, parentWidth, height);

  // Horizontal Grid Lines
  ctx.strokeStyle = '#E2E2DC';
  ctx.lineWidth = 1;
  ctx.font = '500 11px Poppins, sans-serif';
  ctx.fillStyle = PERDA_PALETTE.darkGreen;

  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal / 4) * i);
    const y = pad.top + plotH - (val / maxVal) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.stroke();
    ctx.fillText(String(val), 12, y + 4);
  }

  const stepX = plotW / (labels.length - 1);

  // Soft Area Fill under Trend Line
  ctx.beginPath();
  labels.forEach((_, idx) => {
    const x = pad.left + idx * stepX;
    const y = pad.top + plotH - (bookingsData[idx] / maxVal) * plotH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(96, 108, 56, 0.18)';
  ctx.fill();

  // Olive Green Line (#606C38)
  ctx.beginPath();
  labels.forEach((_, idx) => {
    const x = pad.left + idx * stepX;
    const y = pad.top + plotH - (bookingsData[idx] / maxVal) * plotH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = PERDA_PALETTE.olive;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Data Points in Burnt Orange (#BC6C25) & Labels
  labels.forEach((lbl, idx) => {
    const x = pad.left + idx * stepX;
    const y = pad.top + plotH - (bookingsData[idx] / maxVal) * plotH;

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = PERDA_PALETTE.burntOrange;
    ctx.fill();
    ctx.strokeStyle = PERDA_PALETTE.cream;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Value Tag above node
    ctx.fillStyle = PERDA_PALETTE.darkGreen;
    ctx.font = '700 11px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${bookingsData[idx]} (${revenueK[idx]}k)`, x, y - 12);

    // Month label on X axis
    ctx.font = '600 12px Poppins, sans-serif';
    ctx.fillText(lbl, x, height - 14);
  });
}

/**
 * 2. PAGE 6: OFFICER REPORTS BAR CHART & PIE CHART + FILTERING + EXPORTS
 */
let currentFilteredReportRows = [...REPORT_RECORDS];

function initOfficerReportsPage() {
  const filterForm = document.getElementById('reportFilterForm');
  if (!filterForm) return;

  const districtSelect = document.getElementById('reportDistrictFilter');
  const homestaySelect = document.getElementById('reportHomestayFilter');

  const applyReportFilters = () => {
    const distVal = districtSelect ? districtSelect.value : 'ALL';
    const hsVal = homestaySelect ? homestaySelect.value : 'ALL';

    currentFilteredReportRows = REPORT_RECORDS.filter((row) => {
      const matchDist = distVal === 'ALL' || row.district.toLowerCase().includes(distVal.toLowerCase());
      const matchHs = hsVal === 'ALL' || row.homestayId === hsVal;
      return matchDist && matchHs;
    });

    if (currentFilteredReportRows.length === 0) {
      currentFilteredReportRows = [...REPORT_RECORDS];
    }

    renderReportStatsAndTable(currentFilteredReportRows);
    drawReportsBarChart(currentFilteredReportRows);
    drawReportsPieChart(currentFilteredReportRows);
  };

  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    applyReportFilters();
    showPerdaToast('Report Filters Applied', `Updated analytics for ${currentFilteredReportRows.length} district record(s).`, 'fa-chart-column');
  });

  document.getElementById('resetReportFilterBtn')?.addEventListener('click', () => {
    filterForm.reset();
    applyReportFilters();
  });

  // Export PDF Button
  document.getElementById('exportPdfBtn')?.addEventListener('click', () => {
    showPerdaToast('Preparing Official PERDA PDF Report', 'Opening print-to-PDF preview for BPE PERDA Officer report...', 'fa-file-pdf');
    setTimeout(() => {
      window.print();
    }, 450);
  });

  // Export Excel (.CSV) Button
  document.getElementById('exportExcelBtn')?.addEventListener('click', () => {
    const headers = ['Month', 'Homestay Unit', 'PERDA District', 'Total Bookings', 'Tourist Volume (Guests)', 'Rental Collection (RM)', 'Occupancy Rate'];
    const csvRows = [
      headers.join(','),
      ...currentFilteredReportRows.map((r) =>
        [
          `"${r.month}"`,
          `"${r.homestayName}"`,
          `"${r.district}"`,
          r.bookingsCount,
          r.touristVolume,
          r.collectionRM.toFixed(2),
          `"${r.occupancyRate}"`
        ].join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PERDA_eHomestay_Official_Report_2026.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showPerdaToast('Excel Report Downloaded', 'Saved as PERDA_eHomestay_Official_Report_2026.csv', 'fa-file-excel');
  });

  applyReportFilters();
}

function renderReportStatsAndTable(rows) {
  const totalRevenue = rows.reduce((sum, r) => sum + r.collectionRM, 0);
  const totalTourists = rows.reduce((sum, r) => sum + r.touristVolume, 0);
  const totalBookings = rows.reduce((sum, r) => sum + r.bookingsCount, 0);

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt('statMonthlyCollection', `RM ${totalRevenue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`);
  setTxt('statTouristVolume', `${totalTourists} Guests`);
  setTxt('statTotalDistrictBookings', `${totalBookings} Bookings`);

  const tbody = document.getElementById('reportDataTableBody');
  if (!tbody) return;

  tbody.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td data-label="Period" class="fw-semibold">${r.month}</td>
        <td data-label="Homestay Unit" class="fw-bold">${r.homestayName}</td>
        <td data-label="District"><span class="badge-pill badge-pending">${r.district}</span></td>
        <td data-label="Total Bookings">${r.bookingsCount} stays</td>
        <td data-label="Tourist Volume">${r.touristVolume} pax</td>
        <td data-label="Occupancy"><span class="badge-pill badge-approved">${r.occupancyRate}</span></td>
        <td data-label="Rental Collection" class="fw-bold" style="color: var(--burnt-orange);">RM ${r.collectionRM.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</td>
      </tr>
    `
    )
    .join('');
}

/**
 * Draw Bar Chart: Monthly Rental Collection (RM) using Palette Colors
 */
function drawReportsBarChart(rows) {
  const canvas = document.getElementById('reportsBarChartCanvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth || 520;
  const height = 290;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { top: 28, right: 20, bottom: 48, left: 58 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxRM = Math.max(12000, ...rows.map((r) => r.collectionRM));

  ctx.clearRect(0, 0, width, height);

  // Y-axis grid
  ctx.strokeStyle = '#E2E2DC';
  ctx.fillStyle = PERDA_PALETTE.darkGreen;
  ctx.font = '500 11px Poppins, sans-serif';
  ctx.textAlign = 'right';

  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxRM / 4) * i);
    const y = pad.top + plotH - (val / maxRM) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.stroke();
    ctx.fillText(`RM ${(val / 1000).toFixed(0)}k`, pad.left - 8, y + 4);
  }

  const barSlot = plotW / rows.length;
  const barWidth = Math.min(46, barSlot * 0.58);
  const barColors = [
    PERDA_PALETTE.olive,
    PERDA_PALETTE.burntOrange,
    PERDA_PALETTE.darkGreen,
    PERDA_PALETTE.sand,
    PERDA_PALETTE.olive,
    PERDA_PALETTE.burntOrange
  ];

  rows.forEach((r, idx) => {
    const barH = (r.collectionRM / maxRM) * plotH;
    const x = pad.left + idx * barSlot + (barSlot - barWidth) / 2;
    const y = pad.top + plotH - barH;

    // Rounded top bar
    ctx.fillStyle = barColors[idx % barColors.length];
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, [8, 8, 0, 0]);
    ctx.fill();

    // Amount label above bar
    ctx.fillStyle = PERDA_PALETTE.darkGreen;
    ctx.font = '700 10.5px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`RM ${(r.collectionRM / 1000).toFixed(1)}k`, x + barWidth / 2, y - 7);

    // X-axis label
    ctx.font = '600 11px Poppins, sans-serif';
    ctx.fillText(r.district.split(' ')[0], x + barWidth / 2, height - 18);
  });
}

/**
 * Draw Pie / Doughnut Chart: Bookings by District using Palette Colors
 */
function drawReportsPieChart(rows) {
  const canvas = document.getElementById('reportsPieChartCanvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth || 440;
  const height = 290;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const totalBookings = rows.reduce((s, r) => s + r.bookingsCount, 0) || 1;
  const sliceColors = [
    PERDA_PALETTE.olive,
    PERDA_PALETTE.burntOrange,
    PERDA_PALETTE.darkGreen,
    PERDA_PALETTE.sand,
    '#7A884B',
    '#9E581D'
  ];

  const centerX = Math.min(130, width * 0.34);
  const centerY = height / 2;
  const radius = Math.min(95, height * 0.36);

  let startAngle = -Math.PI / 2;

  rows.forEach((r, idx) => {
    const sliceAngle = (r.bookingsCount / totalBookings) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = sliceColors[idx % sliceColors.length];
    ctx.fill();
    ctx.strokeStyle = PERDA_PALETTE.cream;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    startAngle += sliceAngle;
  });

  // Inner Doughnut Hole in Cream (#FEFAE0)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = PERDA_PALETTE.cream;
  ctx.fill();

  ctx.fillStyle = PERDA_PALETTE.darkGreen;
  ctx.font = '700 16px Playfair Display, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${totalBookings}`, centerX, centerY + 2);
  ctx.font = '600 10px Poppins, sans-serif';
  ctx.fillText('Stays', centerX, centerY + 16);

  // Legend on the right side
  const legendX = centerX + radius + 24;
  let legendY = 48;
  ctx.textAlign = 'left';

  rows.forEach((r, idx) => {
    const pct = Math.round((r.bookingsCount / totalBookings) * 100);
    ctx.fillStyle = sliceColors[idx % sliceColors.length];
    ctx.beginPath();
    ctx.roundRect(legendX, legendY - 10, 14, 14, 4);
    ctx.fill();

    ctx.fillStyle = PERDA_PALETTE.darkGreen;
    ctx.font = '600 11.5px Poppins, sans-serif';
    ctx.fillText(`${r.district} (${pct}%)`, legendX + 22, legendY + 1);
    legendY += 36;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  drawOfficerDashboardTrendChart();
  initOfficerReportsPage();

  window.addEventListener('resize', () => {
    drawOfficerDashboardTrendChart();
    if (document.getElementById('reportsBarChartCanvas')) {
      drawReportsBarChart(currentFilteredReportRows);
      drawReportsPieChart(currentFilteredReportRows);
    }
  });
});

