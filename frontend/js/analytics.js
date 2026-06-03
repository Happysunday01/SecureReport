// ==================== SECURITY ANALYTICS CHARTS ====================

async function initSecurityAnalyticsCharts() {
    console.log('📊 Initializing SECURITY analytics charts...');
    
    // ✅ AWAIT async DB calls
    const incidents = await DB.getIncidents();
    const stats = await DB.getStats();

    // Check if canvas elements exist
    const chartTypeCanvas = document.getElementById('chart-type');
    const chartTrendCanvas = document.getElementById('chart-trend');
    const chartStatusCanvas = document.getElementById('chart-status');
    const chartPriorityCanvas = document.getElementById('chart-priority');

    if (!chartTypeCanvas || !chartTrendCanvas || !chartStatusCanvas || !chartPriorityCanvas) {
        console.error('❌ Security chart canvas elements not found');
        return;
    }

    // Destroy existing charts if they exist
    if (window.securityCharts) {
        Object.values(window.securityCharts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
    window.securityCharts = {};

    // Ensure incidents is an array
    const safeIncidents = Array.isArray(incidents) ? incidents : [];

    // Chart 1: Incidents by Type
    const typeData = getTypeDistribution(safeIncidents);
    window.securityCharts.type = new Chart(chartTypeCanvas, {
        type: 'doughnut',
        data: {
            labels: typeData.labels.length > 0 ? typeData.labels : ['No Data'],
            datasets: [{
                data: typeData.data.length > 0 ? typeData.data : [1],
                backgroundColor: ['#9333EA', '#A855F7', '#C084FC', '#D8B4FE', '#E9D5FF']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { 
                        color: getTheme() === 'dark' ? '#dadaf0' : '#374151',
                        padding: 15
                    }
                }
            }
        }
    });
    console.log('✅ Security Chart Type created');

    // Chart 2: Monthly Trend
    const trendData = getMonthlyTrend(safeIncidents);
    window.securityCharts.trend = new Chart(chartTrendCanvas, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: 'Incidents',
                data: trendData.data,
                borderColor: '#9333EA',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                },
                x: {
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                }
            }
        }
    });
    console.log('✅ Security Chart Trend created');

    // Chart 3: Status Distribution
    // ✅ Ensure stats values are numbers
    const pending = typeof stats.pending === 'number' ? stats.pending : 0;
    const inProgress = typeof stats.inProgress === 'number' ? stats.inProgress : 0;
    const resolved = typeof stats.resolved === 'number' ? stats.resolved : 0;
    
    window.securityCharts.status = new Chart(chartStatusCanvas, {
        type: 'pie',
        data: {
            labels: ['Pending', 'In Progress', 'Resolved'],
            datasets: [{
                data: [pending, inProgress, resolved],
                backgroundColor: ['#FCD34D', '#60A5FA', '#34D399']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { 
                        color: getTheme() === 'dark' ? '#dadaf0' : '#374151',
                        padding: 15
                    }
                }
            }
        }
    });
    console.log('✅ Security Chart Status created');

    // Chart 4: Priority Breakdown
    const priorityData = getPriorityDistribution(safeIncidents);
    window.securityCharts.priority = new Chart(chartPriorityCanvas, {
        type: 'bar',
        data: {
            labels: ['Low', 'Medium', 'High', 'Critical'],
            datasets: [{
                label: 'Incidents',
                data: priorityData,
                backgroundColor: ['#9CA3AF', '#FCD34D', '#F87171', '#DC2626']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                },
                x: {
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                }
            }
        }
    });
    console.log('✅ Security Chart Priority created');
    console.log('✅ All SECURITY analytics charts rendered successfully');
}

// ==================== ADMIN ANALYTICS CHARTS ====================

async function initAdminAnalyticsCharts() {
    console.log('📊 Initializing ADMIN analytics charts...');
    
    // ✅ AWAIT async DB calls
    const incidents = await DB.getIncidents();
    const stats = await DB.getStats();
    const users = await DB.getUsers();

    // Check if canvas elements exist
    const chartTypeCanvas = document.getElementById('admin-chart-type');
    const chartTrendCanvas = document.getElementById('admin-chart-trend');
    const chartUsersCanvas = document.getElementById('admin-chart-users');
    const chartResolutionCanvas = document.getElementById('admin-chart-resolution');

    if (!chartTypeCanvas || !chartTrendCanvas || !chartUsersCanvas || !chartResolutionCanvas) {
        console.error('❌ Admin chart canvas elements not found');
        return;
    }

    // Destroy existing charts if they exist
    if (window.adminCharts) {
        Object.values(window.adminCharts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
    window.adminCharts = {};

    // Ensure arrays
    const safeIncidents = Array.isArray(incidents) ? incidents : [];
    const safeUsers = Array.isArray(users) ? users : [];

    // Chart 1: Incidents by Type
    const typeData = getTypeDistribution(safeIncidents);
    window.adminCharts.type = new Chart(chartTypeCanvas, {
        type: 'doughnut',
        data: {
            labels: typeData.labels.length > 0 ? typeData.labels : ['No Data'],
            datasets: [{
                data: typeData.data.length > 0 ? typeData.data : [1],
                backgroundColor: ['#9333EA', '#A855F7', '#C084FC', '#D8B4FE', '#E9D5FF']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { 
                        color: getTheme() === 'dark' ? '#dadaf0' : '#374151',
                        padding: 15
                    }
                }
            }
        }
    });
    console.log('✅ Admin Chart Type created');

    // Chart 2: Monthly Trend
    const trendData = getMonthlyTrend(safeIncidents);
    window.adminCharts.trend = new Chart(chartTrendCanvas, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: 'Incidents',
                data: trendData.data,
                borderColor: '#9333EA',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                },
                x: {
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                }
            }
        }
    });
    console.log('✅ Admin Chart Trend created');

    // Chart 3: User Activity
    const userCounts = [
        safeUsers.filter(u => u.role === 'student').length,
        safeUsers.filter(u => u.role === 'security').length,
        safeUsers.filter(u => u.role === 'coordinator').length,
        safeUsers.filter(u => u.role === 'admin').length
    ];
    window.adminCharts.users = new Chart(chartUsersCanvas, {
        type: 'bar',
        data: {
            labels: ['Students', 'Security', 'Coordinators', 'Admins'],
            datasets: [{
                label: 'Users',
                data: userCounts,
                backgroundColor: ['#A855F7', '#60A5FA', '#34D399']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                },
                x: {
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                }
            }
        }
    });
    console.log('✅ Admin Chart Users created');

    // Chart 4: Resolution Time (Sample data - could be calculated from incidents)
    window.adminCharts.resolution = new Chart(chartResolutionCanvas, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Avg Resolution Time (hours)',
                data: [24, 18, 12, 8],
                borderColor: '#34D399',
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                },
                x: {
                    ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
                    grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
                }
            }
        }
    });
    console.log('✅ Admin Chart Resolution created');
    console.log('✅ All ADMIN analytics charts rendered successfully');
}

// ==================== HELPER FUNCTIONS ====================

function getTypeDistribution(incidents) {
    // ✅ Ensure incidents is an array
    if (!Array.isArray(incidents)) return { labels: [], data: [] };
    
    const types = {};
    incidents.forEach(i => {
        if (i?.type) {
            types[i.type] = (types[i.type] || 0) + 1;
        }
    });
    return { 
        labels: Object.keys(types), 
        data: Object.values(types) 
    };
}

function getMonthlyTrend(incidents) {
    // ✅ Ensure incidents is an array
    if (!Array.isArray(incidents)) return { labels: [], data: [] };
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = new Array(12).fill(0);
    
    incidents.forEach(i => {
        if (i?.createdAt) {
            const month = new Date(i.createdAt).getMonth();
            data[month]++;
        }
    });
    return { labels: months, data };
}

function getPriorityDistribution(incidents) {
    // ✅ Ensure incidents is an array
    if (!Array.isArray(incidents)) return [0, 0, 0, 0];
    
    const priorities = { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 };
    incidents.forEach(i => {
        if (i?.priority && priorities[i.priority] !== undefined) {
            priorities[i.priority]++;
        }
    });
    return Object.values(priorities);
}

function getTheme() {
    return localStorage.getItem('secureReport_theme') || 'light';
}
async function initSecurityAnalyticsCharts() {
  console.log('📊 Initializing SECURITY analytics charts...');
  
  try {
    // Get data from database
    const incidents = await DB.getIncidents();
    const stats = await DB.getStats();
    
    console.log('📊 Incidents loaded:', incidents?.length || 0);
    console.log('📊 Stats:', stats);
    
    // Check if canvas elements exist
    const chartTypeCanvas = document.getElementById('chart-type');
    const chartTrendCanvas = document.getElementById('chart-trend');
    const chartStatusCanvas = document.getElementById('chart-status');
    const chartPriorityCanvas = document.getElementById('chart-priority');
    
    if (!chartTypeCanvas || !chartTrendCanvas || !chartStatusCanvas || !chartPriorityCanvas) {
      console.error('❌ Chart canvas elements not found!');
      console.log('chart-type:', chartTypeCanvas);
      console.log('chart-trend:', chartTrendCanvas);
      console.log('chart-status:', chartStatusCanvas);
      console.log('chart-priority:', chartPriorityCanvas);
      return;
    }
    
    // Destroy existing charts if they exist
    if (window.securityCharts) {
      Object.values(window.securityCharts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
    }
    window.securityCharts = {};
    
    // Ensure incidents is an array
    const safeIncidents = Array.isArray(incidents) ? incidents : [];
    
    // Chart 1: Incidents by Type
    const typeData = getTypeDistribution(safeIncidents);
    console.log('📊 Type data:', typeData);
    
    window.securityCharts.type = new Chart(chartTypeCanvas, {
      type: 'doughnut',
      data: {
        labels: typeData.labels.length > 0 ? typeData.labels : ['No Data'],
        datasets: [{
          data: typeData.data.length > 0 ? typeData.data : [1],
          backgroundColor: ['#9333EA', '#A855F7', '#C084FC', '#D8B4FE', '#E9D5FF']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { 
              color: getTheme() === 'dark' ? '#dadaf0' : '#374151',
              padding: 15
            }
          }
        }
      }
    });
    console.log('✅ Security Chart Type created');
    
    // Chart 2: Monthly Trend
    const trendData = getMonthlyTrend(safeIncidents);
    console.log('📊 Trend data:', trendData);
    
    window.securityCharts.trend = new Chart(chartTrendCanvas, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [{
          label: 'Incidents',
          data: trendData.data,
          borderColor: '#9333EA',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
            grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
          },
          x: {
            ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
            grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
          }
        }
      }
    });
    console.log('✅ Security Chart Trend created');
    
    // Chart 3: Status Distribution
    const pending = typeof stats.pending === 'number' ? stats.pending : 0;
    const inProgress = typeof stats.inProgress === 'number' ? stats.inProgress : 0;
    const resolved = typeof stats.resolved === 'number' ? stats.resolved : 0;
    
    console.log('📊 Status data:', { pending, inProgress, resolved });
    
    window.securityCharts.status = new Chart(chartStatusCanvas, {
      type: 'pie',
      data: {
        labels: ['Pending', 'In Progress', 'Resolved'],
        datasets: [{
          data: [pending, inProgress, resolved],
          backgroundColor: ['#FCD34D', '#60A5FA', '#34D399']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { 
              color: getTheme() === 'dark' ? '#dadaf0' : '#374151',
              padding: 15
            }
          }
        }
      }
    });
    console.log('✅ Security Chart Status created');
    
    // Chart 4: Priority Breakdown
    const priorityData = getPriorityDistribution(safeIncidents);
    console.log('📊 Priority data:', priorityData);
    
    window.securityCharts.priority = new Chart(chartPriorityCanvas, {
      type: 'bar',
      data: {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        datasets: [{
          label: 'Incidents',
          data: priorityData,
          backgroundColor: ['#9CA3AF', '#FCD34D', '#F87171', '#DC2626']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
            grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
          },
          x: {
            ticks: { color: getTheme() === 'dark' ? '#dadaf0' : '#374151' },
            grid: { color: getTheme() === 'dark' ? '#2d2d44' : '#E5E7EB' }
          }
        }
      }
    });
    console.log('✅ Security Chart Priority created');
    console.log('✅ All SECURITY analytics charts rendered successfully');
    
  } catch (error) {
    console.error('❌ Error in initSecurityAnalyticsCharts:', error);
  }
}
// Global variable to store map instances (prevents re-initialization errors)
window.securityMaps = window.securityMaps || {};

async function initSecurityMap() {
  console.log('🗺️ initSecurityMap called');
  
  try {
    // 1. Check if Leaflet is loaded
    if (typeof L === 'undefined') {
      console.error('❌ Leaflet library not loaded!');
      const container = document.getElementById('map-container');
      if (container) {
        container.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:600px;background:#F9FAFB;border-radius:12px;">
            <div style="text-align:center;color:#6B7280;">
              <i class="fas fa-exclamation-triangle" style="font-size:48px;margin-bottom:16px;color:#F59E0B;"></i>
              <p style="font-size:16px;">Map library not loaded</p>
              <p style="font-size:13px;">Please ensure Leaflet.js is included in index.html</p>
            </div>
          </div>
        `;
      }
      return;
    }
    
    // 2. Get incidents with location data
    const incidents = await DB.getIncidents();
    const incidentsWithLocation = Array.isArray(incidents) 
      ? incidents.filter(i => {
          const lat = i.lat !== undefined && i.lat !== null ? parseFloat(i.lat) : null;
          const lng = i.lng !== undefined && i.lng !== null ? parseFloat(i.lng) : null;
          return lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);
        })
      : [];
    
    console.log('📍 Incidents with valid location:', incidentsWithLocation.length);
    
    // 3. Get map container
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
      console.error('❌ Map container #map-container not found!');
      return;
    }
    
    // 4. ✅ CRITICAL: Destroy existing map instance if it exists
    const mapId = 'security-map';
    if (window.securityMaps[mapId]) {
      console.log('🗑️ Destroying existing map instance');
      window.securityMaps[mapId].remove();
      delete window.securityMaps[mapId];
    }
    
    // 5. Clear container content (in case of previous error state)
    mapContainer.innerHTML = '';
    
    // 6. Handle case: No incidents with location
    if (incidentsWithLocation.length === 0) {
      mapContainer.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:600px;background:#F9FAFB;border-radius:12px;">
          <div style="text-align:center;color:#6B7280;">
            <i class="fas fa-map-marked-alt" style="font-size:64px;margin-bottom:16px;opacity:0.3;"></i>
            <p style="font-size:18px;font-weight:600;">No incidents with location data</p>
            <p style="font-size:14px;">Incidents need GPS coordinates to appear on the map</p>
          </div>
        </div>
      `;
      return;
    }
    
    // 7. ✅ CRITICAL: Ensure container is visible before initializing map
    // Leaflet throws offsetWidth error if container is hidden (display:none)
    const isContainerVisible = mapContainer.offsetParent !== null;
    
    if (!isContainerVisible) {
      console.log('⚠️ Map container is hidden, deferring initialization...');
      // Store incidents for later initialization when tab becomes visible
      mapContainer.dataset.pendingIncidents = JSON.stringify(incidentsWithLocation);
      
      // Add a one-time listener to initialize when container becomes visible
      const observer = new MutationObserver(() => {
        if (mapContainer.offsetParent !== null) {
          console.log('✅ Map container now visible, initializing...');
          observer.disconnect();
          initSecurityMap(); // Re-call this function
        }
      });
      
      observer.observe(mapContainer.parentElement, { 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
      });
      
      // Show placeholder
      mapContainer.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:600px;background:#F9FAFB;border-radius:12px;">
          <div style="text-align:center;color:#6B7280;">
            <i class="fas fa-spinner fa-spin" style="font-size:32px;margin-bottom:16px;"></i>
            <p>Loading map...</p>
          </div>
        </div>
      `;
      return;
    }
    
    // 8. Create the map
    console.log('🗺️ Creating new Leaflet map instance');
    const map = L.map('map-container', {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: true
    });
    
    // Add tile layer (OpenStreetMap - free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    
    // 9. Add markers for each incident
    incidentsWithLocation.forEach(incident => {
      const lat = parseFloat(incident.lat);
      const lng = parseFloat(incident.lng);
      
      // Marker color based on status
      let color = '#9333EA'; // Default purple
      if (incident.status === 'Resolved') color = '#10B981'; // Green
      else if (incident.status === 'In Progress') color = '#3B82F6'; // Blue
      else if (incident.status === 'Pending') color = '#F59E0B'; // Yellow
      
      // Create custom icon with colored dot
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width:20px;height:20px;background:${color};
          border:3px solid white;border-radius:50%;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      
      // Popup content
      const popupContent = `
        <div style="min-width:220px;font-family:Inter,sans-serif;">
          <h4 style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#1F2937;">
            ${incident.id}
            ${incident.anonymous ? '<span style="font-size:11px;color:#9333EA;margin-left:6px;">🕵️ Anonymous</span>' : ''}
          </h4>
          <p style="margin:4px 0;font-size:13px;"><strong>Type:</strong> ${incident.type}</p>
          <p style="margin:4px 0;font-size:13px;"><strong>Status:</strong> 
            <span style="padding:2px 8px;background:${color}20;color:${color};border-radius:12px;font-size:11px;">
              ${incident.status}
            </span>
          </p>
          <p style="margin:4px 0;font-size:13px;"><strong>Priority:</strong> ${incident.priority}</p>
          <p style="margin:4px 0;font-size:13px;"><strong>Location:</strong> ${incident.location || 'N/A'}</p>
          <p style="margin:4px 0;font-size:12px;color:#6B7280;"><strong>Reported:</strong> ${formatDate(incident.createdAt)}</p>
          ${incident.evidence ? '<p style="margin:8px 0 0 0;font-size:12px;">📎 Has evidence</p>' : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });
    
    // 10. Fit map to show all markers
    if (incidentsWithLocation.length > 0) {
      const bounds = L.latLngBounds(
        incidentsWithLocation.map(i => [parseFloat(i.lat), parseFloat(i.lng)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // 11. Store map instance for later cleanup
    window.securityMaps[mapId] = map;
    
    console.log('✅ Security map initialized with', incidentsWithLocation.length, 'markers');
    
  } catch (error) {
    console.error('❌ Error initializing security map:', error);
    
    const container = document.getElementById('map-container');
    if (container) {
      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:600px;background:#F9FAFB;border-radius:12px;">
          <div style="text-align:center;color:#EF4444;">
            <i class="fas fa-exclamation-circle" style="font-size:48px;margin-bottom:16px;"></i>
            <p style="font-size:16px;font-weight:600;">Error loading map</p>
            <p style="font-size:13px;">${error.message}</p>
            <button onclick="initSecurityMap()" style="margin-top:12px;padding:8px 16px;background:#9333EA;color:white;border:none;border-radius:6px;cursor:pointer;">
              🔄 Retry
            </button>
          </div>
        </div>
      `;
    }
  }
}

// ✅ Make function globally accessible
window.initSecurityMap = initSecurityMap;