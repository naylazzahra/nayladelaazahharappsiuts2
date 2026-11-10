/**
 * AirSense City - Leaflet Map Integration
 * Pusat Kota Bandar Lampung & 5 Titik Pantau ISPU
 * Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom
 */

class AirSenseMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markers = {};
    this.circles = {};
  }

  init(store) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Koordinat pusat Kota Bandar Lampung
    const bdlCenter = [-5.4128, 105.2575];

    this.map = L.map(this.containerId, {
      center: bdlCenter,
      zoom: 12,
      zoomControl: true,
      attributionControl: false
    });

    // Basemap OpenStreetMap CartoDB Positron / OSM standard
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(this.map);

    this.renderMarkers(store);
  }

  renderMarkers(store) {
    if (!this.map) return;

    const stations = store.stations;

    stations.forEach(st => {
      const status = getISPUStatus(st.ispu);
      
      let markerColor = '#005036'; // Baik
      if (status.key === 'sedang') markerColor = '#4059aa';
      else if (status.key === 'tidak-sehat') markerColor = '#ba1a1a';
      else if (status.key === 'sangat-tidak-sehat') markerColor = '#93000a';
      else if (status.key === 'berbahaya') markerColor = '#213145';

      // Custom HTML Pin
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 44px;">
          <span class="absolute w-8 h-8 rounded-full opacity-60 animate-ping" style="background-color: ${markerColor}"></span>
          <div class="w-10 h-10 rounded-full flex flex-col items-center justify-center text-white shadow-md border-2 border-white font-bold transition-transform group-hover:scale-110" style="background-color: ${markerColor}">
            <span class="text-[11px] leading-tight font-extrabold">${st.ispu}</span>
            <span class="text-[8px] leading-none uppercase font-semibold">ISPU</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'airsense-marker-pin',
        html: iconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      if (this.markers[st.id]) {
        this.markers[st.id].setLatLng([st.lat, st.lng]);
        this.markers[st.id].setIcon(customIcon);
      } else {
        const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(this.map);
        this.markers[st.id] = marker;

        marker.on('click', () => {
          store.setSelectedStation(st.id);
          // Highlight
        });
      }

      // Hotspot circle coverage
      if (this.circles[st.id]) {
        this.circles[st.id].setLatLng([st.lat, st.lng]);
        this.circles[st.id].setStyle({
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: st.ispu >= 101 ? 0.22 : 0.08
        });
      } else {
        const circle = L.circle([st.lat, st.lng], {
          radius: 1400,
          color: markerColor,
          weight: 1.5,
          fillColor: markerColor,
          fillOpacity: st.ispu >= 101 ? 0.22 : 0.08
        }).addTo(this.map);
        this.circles[st.id] = circle;
      }

      // Popup Content
      const popupContent = `
        <div class="p-2 min-w-[220px] font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-gray-200 pb-1 mb-2">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">${st.code}</span>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold" style="background-color: ${markerColor}20; color: ${markerColor}">
              ${status.label}
            </span>
          </div>
          <h4 class="font-bold text-sm text-[#003441] mb-1">${st.name}</h4>
          <p class="text-xs text-gray-600 mb-2">${st.location}</p>
          <div class="grid grid-cols-2 gap-1.5 bg-[#eff4ff] p-2 rounded-lg text-xs mb-2">
            <div><span class="text-gray-500 block text-[10px]">ISPU Terhitung</span><strong class="text-sm font-extrabold" style="color: ${markerColor}">${st.ispu}</strong></div>
            <div><span class="text-gray-500 block text-[10px]">PM2.5</span><strong class="text-sm font-bold text-gray-800">${st.pm25} µg/m³</strong></div>
            <div><span class="text-gray-500 block text-[10px]">PM10</span><span class="font-semibold text-gray-800">${st.pm10} µg/m³</span></div>
            <div><span class="text-gray-500 block text-[10px]">Suhu / RH</span><span class="font-semibold text-gray-800">${st.temp}°C / ${st.rh}%</span></div>
          </div>
          <button onclick="window.airSenseStore.setSelectedStation('${st.id}'); window.navigateTo('dashboard');" 
                  class="w-full py-1 text-center bg-[#0f4c5c] text-white rounded text-xs font-bold hover:bg-[#003441] transition-colors">
            Fokus Pantau Stasiun
          </button>
        </div>
      `;

      this.markers[st.id].bindPopup(popupContent);
    });
  }

  focusStation(station) {
    if (!this.map || !station) return;
    this.map.setView([station.lat, station.lng], 14, { animate: true });
    if (this.markers[station.id]) {
      this.markers[station.id].openPopup();
    }
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 200);
    }
  }
}

window.airSenseMap = new AirSenseMap('leaflet-map-container');

