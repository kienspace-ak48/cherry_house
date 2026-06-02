/**
 * Interactive map pin picker for admin branch form (Leaflet + Nominatim geocode).
 */
(function () {
  const mapEl = document.getElementById('branchMapPickerMap');
  if (!mapEl || typeof L === 'undefined') return;

  const DEFAULT = { lat: 11.9404, lng: 108.4583, zoom: 15 };

  // Leaflet default marker assets (CDN)
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  const els = {
    lat: document.getElementById('mapLat'),
    lng: document.getElementById('mapLng'),
    zoom: document.getElementById('mapZoom'),
    googleUrl: document.getElementById('mapGoogleMapsUrl'),
    label: document.getElementById('mapLabel'),
    badge: document.getElementById('mapPinBadge'),
    pinInfo: document.getElementById('mapPinInfo'),
    embed: document.getElementById('mapEmbedUrl'),
    address: document.getElementById('address'),
    name: document.getElementById('name'),
    tagline: document.getElementById('tagline'),
    status: document.getElementById('branchMapPickerStatus'),
    previewLink: document.getElementById('linkPreviewMaps'),
    pasteInput: document.getElementById('pasteMapsInput'),
    pastePanel: document.getElementById('pasteMapsPanel'),
  };

  let map;
  let marker;

  function setStatus(msg, type) {
    if (!els.status) return;
    els.status.textContent = msg || '';
    els.status.className = `small mb-2 ${type === 'error' ? 'text-danger' : type === 'ok' ? 'text-success' : 'text-body-secondary'}`;
  }

  function parseNum(raw) {
    const n = Number(String(raw ?? '').trim().replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  function readCoords() {
    const lat = parseNum(els.lat?.value);
    const lng = parseNum(els.lng?.value);
    if (lat == null || lng == null) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  }

  function buildGoogleMapsUrl(lat, lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  function syncGoogleUrl(lat, lng) {
    if (!els.googleUrl) return;
    const current = els.googleUrl.value.trim();
    if (!current || current.includes('maps.google') || current.includes('google.com/maps')) {
      els.googleUrl.value = buildGoogleMapsUrl(lat, lng);
    }
    if (els.previewLink) {
      els.previewLink.href = els.googleUrl.value || buildGoogleMapsUrl(lat, lng);
      els.previewLink.classList.remove('d-none');
    }
  }

  function applyCoords(lat, lng, opts = {}) {
    const zoom = opts.zoom ?? parseNum(els.zoom?.value) ?? DEFAULT.zoom;
    if (els.lat) els.lat.value = String(lat);
    if (els.lng) els.lng.value = String(lng);
    if (els.zoom && opts.zoom != null) els.zoom.value = String(zoom);
    syncGoogleUrl(lat, lng);

    if (marker) {
      marker.setLatLng([lat, lng]);
    } else if (map) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', onMarkerMoved);
    }
    if (map) map.setView([lat, lng], Math.min(18, Math.max(4, zoom)));
    if (!opts.silent) setStatus(`Đã đặt ghim: ${lat.toFixed(5)}, ${lng.toFixed(5)}`, 'ok');
  }

  function onMarkerMoved() {
    const pos = marker.getLatLng();
    applyCoords(pos.lat, pos.lng, { silent: true });
    setStatus(`Đã đặt ghim: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`, 'ok');
  }

  function parseCoordsFromGoogleUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const s = url.trim();

    let m = s.match(/[?&]q=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
    if (m) return { lat: Number(m[1]), lng: Number(m[2]) };

    m = s.match(/@(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (m) return { lat: Number(m[1]), lng: Number(m[2]) };

    m = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (m) return { lat: Number(m[1]), lng: Number(m[2]) };

    m = s.match(/[?&]query=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
    if (m) return { lat: Number(m[1]), lng: Number(m[2]) };

    m = s.match(/place\/[^/]+\/@(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (m) return { lat: Number(m[1]), lng: Number(m[2]) };

    return null;
  }

  function initMap() {
    const existing = readCoords();
    const center = existing || DEFAULT;
    const zoom = parseNum(els.zoom?.value) ?? center.zoom ?? DEFAULT.zoom;

    map = L.map(mapEl, { scrollWheelZoom: true }).setView([center.lat, center.lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (existing) {
      marker = L.marker([existing.lat, existing.lng], { draggable: true }).addTo(map);
      marker.on('dragend', onMarkerMoved);
      syncGoogleUrl(existing.lat, existing.lng);
    }

    map.on('click', (e) => {
      applyCoords(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(() => map.invalidateSize(), 200);
  }

  async function geocodeFromAddress() {
    const addr = els.address?.value?.trim();
    if (!addr) {
      setStatus('Nhập địa chỉ chi nhánh (ô phía trên) trước khi tìm.', 'error');
      els.address?.focus();
      return;
    }

    setStatus('Đang tìm vị trí…');
    const q = [addr, 'Việt Nam'].filter(Boolean).join(', ');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { Accept: 'application/json' } },
      );
      const data = await res.json();
      if (!data?.length) {
        setStatus('Không tìm thấy. Thử địa chỉ cụ thể hơn hoặc click trên bản đồ.', 'error');
        return;
      }
      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      applyCoords(lat, lng, { zoom: 16 });
      setStatus(`Đã tìm thấy: ${data[0].display_name}`, 'ok');
    } catch (err) {
      console.error(err);
      setStatus('Lỗi khi tìm địa chỉ. Thử lại hoặc chọn trên bản đồ.', 'error');
    }
  }

  function fillLabelsFromForm() {
    const name = els.name?.value?.trim();
    const tag = els.tagline?.value?.trim();
    if (name && els.label && !els.label.value.trim()) els.label.value = name;
    if (tag && els.pinInfo && !els.pinInfo.value.trim()) els.pinInfo.value = tag;
    if (!els.badge?.value.trim()) els.badge.value = 'CH';
    setStatus('Đã điền nhãn / mô tả từ tên và tagline (nếu ô còn trống).', 'ok');
  }

  function applyPasteMaps() {
    const url = els.pasteInput?.value?.trim() || els.googleUrl?.value?.trim();
    if (!url) {
      setStatus('Dán link Google Maps vào ô trên.', 'error');
      return;
    }
    const coords = parseCoordsFromGoogleUrl(url);
    if (!coords) {
      setStatus('Không đọc được tọa độ từ link. Thử link có dạng ?q=lat,lng hoặc click bản đồ.', 'error');
      return;
    }
    if (els.googleUrl) els.googleUrl.value = url;
    applyCoords(coords.lat, coords.lng, { zoom: 16 });
    if (els.pastePanel) {
      const collapse = bootstrap.Collapse.getInstance(els.pastePanel);
      collapse?.hide();
    }
  }

  function bindCoordInputs() {
    const handler = () => {
      const c = readCoords();
      if (!c) return;
      if (marker) marker.setLatLng([c.lat, c.lng]);
      else if (map) {
        marker = L.marker([c.lat, c.lng], { draggable: true }).addTo(map);
        marker.on('dragend', onMarkerMoved);
      }
      map?.setView([c.lat, c.lng]);
      syncGoogleUrl(c.lat, c.lng);
    };
    els.lat?.addEventListener('change', handler);
    els.lng?.addEventListener('change', handler);
    els.zoom?.addEventListener('change', () => {
      const c = readCoords();
      const z = parseNum(els.zoom?.value);
      if (c && map && z) map.setZoom(z);
    });
  }

  document.getElementById('btnGeocodeAddress')?.addEventListener('click', geocodeFromAddress);
  document.getElementById('btnFillPinLabels')?.addEventListener('click', fillLabelsFromForm);
  document.getElementById('btnApplyPasteMaps')?.addEventListener('click', applyPasteMaps);
  document.getElementById('btnTogglePasteMaps')?.addEventListener('click', () => {
    if (!els.pastePanel || typeof bootstrap === 'undefined') return;
    bootstrap.Collapse.getOrCreateInstance(els.pastePanel).toggle();
  });

  els.pasteInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyPasteMaps();
    }
  });

  initMap();
  bindCoordInputs();

  if (!readCoords()) {
    setStatus('Chưa có ghim — bấm «Tìm từ địa chỉ» hoặc click bản đồ.');
  }
})();
