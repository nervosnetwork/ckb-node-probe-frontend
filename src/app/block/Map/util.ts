import { Data } from '@/interface/page';
import { isMobileDevice } from '@/app/utils';

export function renderMapWithMarker(nodeInfo: any, onClose?: () => void) {
  const _window = window as any;
  const L = _window.L;
  const map = _window._map;

  if (!map) return;

  const searchMarkers = document.querySelectorAll('.search-node-marker');
  searchMarkers.forEach((marker) => marker.remove());

  map.eachLayer((layer: any) => {
    if (layer._popup && layer._popup._isOpen) {
      map.removeLayer(layer);
    }
  });

  const searchIcon = L.divIcon({
    html: `<div class="search-node-marker">
      <div class="marker-inner"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: '',
  });
  const marker = L.marker([nodeInfo.latitude, nodeInfo.longitude], { icon: searchIcon }).addTo(map);

  const popupContent = `
    <div class="node-info-popup">
      <span class="popup-close-btn" onclick="window._closeNodePopup()">×</span>
      <div class="node-id-section">
        <div class="field-label">NODE ID</div>
        <div class="node-id-value">${nodeInfo.id}</div>
      </div>
      <div class="node-details">
        <div class="detail-item">
          <div class="field-label">VERSION</div>
          <div class="version-value">${nodeInfo.version_short || nodeInfo.version}</div>
        </div>
        <div class="detail-item">
          <div class="field-label">LOCATION</div>
          <div class="location-value">${nodeInfo.city}, ${nodeInfo.country}</div>
        </div>
      </div>
    </div>
  `;
  
  // Set up close handler
  _window._closeNodePopup = () => {
    map.closePopup();
    // Remove the marker
    map.removeLayer(marker);
    if (onClose) onClose();
    // Also clear URL params
    window.history.pushState(null, '', window.location.pathname);
  };

  marker
    .bindPopup(popupContent, {
      closeButton: false,
      autoPan: false,
      className: 'right-side-popup',
      offset: [20, 0],
    })
    .openPopup();
    
  // Handle popup close event
  marker.on('popupclose', () => {
    // Remove the marker when popup is closed
    map.removeLayer(marker);
    if (onClose) onClose();
  });

  map.setView([nodeInfo.latitude, nodeInfo.longitude], 6);

  if (!document.getElementById('perfect-popup-styles')) {
    const style = document.createElement('style');
    style.id = 'perfect-popup-styles';
    style.innerHTML = `
      .search-node-marker {
        background: linear-gradient(135deg, #0FF082 0%, #6CE37C 100%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(15, 240, 130, 0.4), 0 0 0 8px rgba(15, 240, 130, 0.1);
        animation: pulse 2s infinite;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .marker-inner {
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 4px 12px rgba(15, 240, 130, 0.4), 0 0 0 8px rgba(15, 240, 130, 0.1);
        }
        50% {
          box-shadow: 0 4px 16px rgba(15, 240, 130, 0.6), 0 0 0 12px rgba(15, 240, 130, 0.2);
        }
        100% {
          box-shadow: 0 4px 12px rgba(15, 240, 130, 0.4), 0 0 0 8px rgba(15, 240, 130, 0.1);
        }
      }

      .leaflet-popup-content {
        margin: 0 !important;
      }

      /* Right Side Popup Positioning */
      .right-side-popup {
        /* Container positioning */
        z-index: 10000 !important; /* Ensure popup is above header */
      }

      .right-side-popup .leaflet-popup-content-wrapper {
        background: transparent !important;
        padding: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
      }

      .right-side-popup .leaflet-popup-content {
        margin: 0 !important;
        width: auto !important;
      }

      .right-side-popup .leaflet-popup-tip-container {
        /* Hide the tip completely */
        display: none !important;
      }

      .right-side-popup .leaflet-popup-tip {
        /* Hide the tip completely */
        display: none !important;
      }

      /* Node Info Popup Styles */
      .node-info-popup {
        width: 430px;
        font-family: 'Cascadia Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background: #2E3038;
        border-radius: 16px;
        color: white;
        box-shadow: 0 12px 48px rgba(0,0,0,0.4);
        overflow: hidden;
        position: relative;
        border: 1px solid #565A6A;
      }

      .status-indicator {
        width: 12px;
        height: 12px;
        background: #0FF082;
        border-radius: 50%;
        margin-right: 10px;
        box-shadow: 0 0 12px rgba(15, 240, 130, 0.6);
        animation: glow 2s infinite;
      }

      @keyframes glow {
        0%, 100% { box-shadow: 0 0 12px rgba(15, 240, 130, 0.6); }
        50% { box-shadow: 0 0 18px rgba(15, 240, 130, 0.8); }
      }

      .node-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }

      .node-id-section {
        padding: 16px 20px 12px 20px;
      }

      .field-label {
        font-size: 11px;
        color: #6CE37C;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
      }

      .node-id-value {
        font-size: 13px;
        font-family: 'Cascadia Mono', monospace;
        background: #131417;
        padding: 12px 16px;
        border-radius: 10px;
        word-break: break-all;
        border: 1px solid #565A6A;
        backdrop-filter: blur(10px);
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
      }

      .node-details {
        display: flex;
        gap: 20px;
        padding: 12px 20px 20px 20px;
      }

      .detail-item {
        flex: 1;
      }

      .version-value {
        font-size: 16px;
        font-weight: 700;
        color: #0FF082;
        margin-top: 4px;
        text-shadow: 0 0 8px rgba(15, 240, 130, 0.3);
      }

      .location-value {
        font-size: 16px;
        font-weight: 600;
        margin-top: 4px;
        color: rgba(255,255,255,0.95);
      }
      
      .popup-close-btn {
        position: absolute;
        top: 16px;
        right: 20px;
        font-size: 20px;
        color: #565A6A;
        cursor: pointer;
        line-height: 1;
        transition: color 0.2s ease;
        z-index: 10;
      }
      
      .popup-close-btn:hover {
        color: #0FF082;
      }
    `;
    document.head.appendChild(style);
  }
}

export function renderMapGraph(data: Data[]) {
  const container = 'mapGraph';
  const body = document.body;
  if (!document.getElementById(container)) return;
  const disableScroll = () => {
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.width = '100vw';
    body.style.height = '100vh';
  };
  const enableScroll = () => {
    body.style.overflow = '';
    body.style.position = '';
    body.style.width = '';
    body.style.height = '';
  };
  let map: any;
  const _window = window as any;
  const L = _window.L;

  if (_window._map) map = _window._map;
  else {
    map = L.map(container, {
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
    }).setView([0, 0], isMobileDevice() ? 1 : 2);
    _window._map = map;
    L.tileLayer(
      `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${encodeURIComponent(process.env.NEXT_PUBLIC_CARTO_API_KEY || '')}`,
      {
        minZoom: 2,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    ).addTo(map);
  }

  if (!data.length) return;

  document
    .querySelectorAll('.leaflet-control-zoom,.leaflet-control-zoom-fullscreen,.move-control')
    .forEach((target) => target.remove());
  document.querySelector('.leaflet-heatmap-layer')?.remove();
  const markerTarget = document.querySelector('.leaflet-marker-pane');
  if (markerTarget) markerTarget.innerHTML = '';

  map.removeControl(L.control.zoom());
  map.removeControl(L.control.fullscreen());
  map.addControl(L.control.zoom({ position: 'bottomright' }));
  map.addControl(L.control.fullscreen({ position: 'topright' }));

  const heatMapData = [] as object[];
  data.forEach(({ latitude, longitude }) => {
    if (latitude === null && longitude === null) return;
    heatMapData.push([latitude, longitude, 5000]);
  });

  L.heatLayer(heatMapData, { radius: 15 }).addTo(map);

  // if (isMobileDevice()) {
  //   const moveControl = L.control();
  //   moveControl.setPosition('bottomright');
  //   document.addEventListener("fullscreenchange", ()=> {
  //     if (document.fullscreenElement) {
  //       message.destroy()
  //       disableScroll();
  //     } else {
  //       message.destroy()
  //       enableScroll();
  //     }
  //   })
  //   moveControl.onAdd = () => {
  //     const lockIcon = 'lock-icon';
  //     const unLockIcon = 'unlock-icon';
  //     const container = L.DomUtil.create('div', 'move-control');
  //
  //     container.innerHTML = `<span class="${unLockIcon}"></span>`;
  //     container.style.cursor = 'pointer';
  //
  //     L.DomEvent.on(container, 'touchstart', (event: Event) => {
  //       const target = document.querySelector('.move-control>span');
  //       if(!target) return;
  //
  //       let newClass = lockIcon;
  //       let messageContent = "Locked successfully!";
  //
  //       if (target.className === lockIcon) {
  //         map.dragging.enable();
  //         newClass = unLockIcon;
  //         messageContent = "Unlocked, you can drag and move the map!";
  //       } else map.dragging.disable();
  //
  //       target.setAttribute('class', newClass);
  //       message.success(messageContent);
  //     });
  //
  //     return container;
  //   };
  //   moveControl.addTo(map);
  //   map.dragging.disable();
  // }
}
